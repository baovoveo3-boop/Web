# Windows Licensing & Security Research Report
**Version:** 1.1  
**Date:** June 22, 2026  
**Status:** Approved for Implementation  
**Target Applications:** Python-Based Windows Desktop Automation Tools  

---

## 1. Executive Summary

This report delivers a production-grade, end-to-end licensing, database, obfuscation, and update architecture for Python-based Windows desktop automation applications. Desktop client licensing presents a unique challenge: the client operates in a hostile user-controlled environment where the code, network communications, and system APIs are subject to local analysis, modification, and spoofing. 

To address these vulnerabilities, this architecture abandons simple validation paradigms and establishes a **defense-in-depth security framework**:
1. **Weighted Composite HWID**: A stable, non-admin hardware fingerprint matching system that tolerates minor component swaps or OS reinstalls through a threshold scoring mechanism ($S \ge 0.50$, minimum total valid weight $\ge 8$, requiring at least one major physical component match if evaluated) and heals itself dynamically.
2. **Cloud-Mediated State Management**: A secure Firestore schema managed entirely by backend APIs (Firebase Cloud Functions), with direct client read/write access strictly disabled.
3. **Cryptographically Bound Lifecycle**: A license validation flow relying on asymmetric digital signatures (Ed25519) and ephemeral, client-generated nonces to prevent replay attacks and API response mocking.
4. **Payload-Dependent Execution & Local HWID Encryption**: Mitigation of client-side code patching (cracking) by encrypting the application's core compiled `.pyd` modules, decrypting them to temp disk paths, importing them dynamically, and immediately deleting them. To protect the decryption key from exposure, it is encrypted locally using a key derived from the client's own HWID (via PBKDF2).
5. **Native Binary Compilation**: Obfuscation and protection of source intellectual property using Nuitka to translate Python bytecode to native C++ machine binaries, rendering bytecode decompilers ineffective.
6. **Secure Detached Updates**: A robust Over-The-Air (OTA) update system utilizing JSON manifests, digital signatures for origin verification, and a detached PowerShell script invoked via python's `subprocess.Popen` with list arguments to handle file locking and hot-swapping on Windows.

---

## 2. Hardware ID (HWID) Extraction Logic

### 2.1. Identifier Component Matrix
To build an identity fingerprint that minimizes collision rates (different machines sharing an ID) while maximizing stability (not breaking on minor configuration changes), we extract five specific core hardware and OS values. Network MAC addresses are excluded from the core hash due to instability from VPNs, virtualization, and OS randomization.

| Component | Registry / WMI Source Path | Uniqueness | OS Install Stability | Hardware Upgrade Stability | Weights |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Motherboard UUID** | `Win32_ComputerSystemProduct` -> `UUID` | Very High | Perfect (BIOS level) | Medium (Changes if motherboard replaced) | **4** |
| **Primary Disk Serial** | `Win32_DiskDrive` -> `SerialNumber` (Index 0) | Very High | Perfect (Firmware level) | Medium (Changes if boot drive replaced) | **4** |
| **Windows MachineGuid** | `HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid` | Perfect | Zero (Regenerated on clean install) | Perfect (Immune to hardware swaps) | **3** |
| **Motherboard Serial** | `Win32_BaseBoard` -> `SerialNumber` | Medium-High | Perfect (BIOS level) | Medium (Changes if motherboard replaced) | **2** |
| **CPU Processor ID** | `Win32_Processor` -> `ProcessorId` | Low | Perfect | Medium (Changes if CPU upgraded) | **1** |

---

### 2.2. Multi-Tier Query Engine & Fallbacks
Windows environments vary significantly. The Windows Management Instrumentation (WMI) service can be corrupted, and modern Windows 11 builds deprecate or disable `wmic.exe`. To ensure high availability, the client implements a three-tier querying cascade:
1. **Tier 1 (Modern WMI/CIM)**: Calls `Get-CimInstance` via PowerShell, which is fast, native, and bypasses legacy WMI pipelines.
2. **Tier 2 (Legacy WMIC)**: Falls back to `wmic.exe` execution for legacy systems or contexts where PowerShell is restricted.
3. **Tier 3 (Direct Registry/BIOS)**: Reads direct registry paths in `HKEY_LOCAL_MACHINE` (e.g., `HARDWARE\DESCRIPTION\System\BIOS`). These paths are readable by standard users, require no administrative privileges, and operate independently of the WMI subsystem.

### 2.3. Sanitization & VM Detection
* **Sanitization**: Raw values returned by WMI or Registry are stripped of whitespace and non-alphanumeric characters, and forced to lowercase. Placeholder dummy strings (e.g., `"none"`, `"unknown"`, `"to be filled by o.e.m."`, `"default string"`) or empty/zeroed UUIDs are detected via regex and discarded, translating to a `000000000000` (null) hash slice.
* **VM Detection & Extraction Filters**: Virtual Machines (VMs) allow license duplication through cloning. To prevent attackers inside a VM from bypassing detection or using virtual loopback/VPN interfaces, the client implements the following controls:
  1. **Dynamic Boot Drive Identification**: The client retrieves the serial number of the physical disk associated with the active system partition (typically `C:`) rather than querying index 0, utilizing fallback WMI associations if CIM instances fail.
  2. **Hypervisor Checks**: The system flags a VM environment if the system manufacturer, model, or BIOS version matches hypervisor strings (`"virtualbox"`, `"vmware"`, `"hyperv"`, `"qemu"`, `"kvm"`, `"xen"`, `"parallels"`, `"virtual"`, `"virtualmachine"`, `"vrtual"`).
  3. **VM Disk Serial Check**: The primary disk serial check filters out prefixes starting with `"vbox"` or `"prl_"` (and contains other virtual indicators like `"vmware"` or `"qemu"`), specifically avoiding false positives on Western Digital physical disk drives whose serial numbers start with `"VB"`.
  4. **Physical Adapter MAC Filtering**: MAC address extraction is filtered to include only network interfaces where `PhysicalAdapter` is True (`$_.PhysicalAdapter -eq $true` in PowerShell and `physicaladapter=true` in WMIC), preventing virtual loopbacks or VPN interfaces from bypassing VM OUI analysis. Standard VM OUI prefixes checked include `08:00:27` (VirtualBox), `00:05:69`/`00:0c:29`/`00:50:56` (VMware), `00:15:5d`/`00:16:3e` (Hyper-V), `52:54:00` (QEMU/KVM), and `00:1c:42` (Parallels).

---

### 2.4. Threshold-Based Validation & Self-Healing
The client constructs a composite identifier token formatted as:
$$\text{v1:UUID\_hash:Disk\_hash:Board\_hash:MachineGuid\_hash:CPU\_hash}$$
Where each segment represents the first 12 characters of the SHA-256 hash of the sanitized component value.

When matching the stored registered HWID against the current machine HWID, a secure verification algorithm (`verify_hwid_secure`) is implemented to prevent spoofing or WMI disabling bypasses:
1. **WMI Spoofing Check**: The validator enforces a minimum total valid weight of **8** ($\sum \text{Total Valid Component Weights} \ge 8$). If WMI is disabled or spoofed (causing multiple components to report `000000000000`), the validation fails.
2. **Major Components Matching**: At least one major physical component (Motherboard UUID or Primary Disk Serial) must match if evaluated. If both are evaluated but neither matches, the validation is rejected. Crucially, a Custom PC with completely missing motherboard details (UUID and baseboard serial are both missing/not evaluated) will securely fail (lockout) validation upon an SSD upgrade to prevent cloning, since there are no other hardware identifiers available to distinguish upgrades from clones. This design decision prioritizes security over convenience, requiring a manual support reset in this specific scenario.
3. **Score Threshold**: The default matching threshold is set to **0.50** ($50\%$ match). This lower threshold accommodates hardware upgrades on custom PCs and concurrent SSD + OS upgrades.
4. **Self-Healing & Restoration**: If validation passes ($S \ge 0.50$) but $S < 1.0$, the validation flags `needs_update = True`. Crucially, if any individual component goes from missing to present (`r_part == "000000000000" and c_part != "000000000000"`), the validator also triggers self-healing by setting `needs_update = True`. The client automatically sends the updated HWID token to the server to dynamically heal and restore the registered license configuration.

---

### 2.5. Python HWID Extraction Implementation
```python
import subprocess
import winreg
import platform
import hashlib
import re
import sys

def run_cmd(cmd_list):
    """Safely runs a command on Windows without popping up a console window."""
    try:
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        result = subprocess.run(
            cmd_list,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            startupinfo=startupinfo,
            timeout=8
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None

def run_powershell(cmd):
    """Executes a PowerShell command."""
    return run_cmd(["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", cmd])

def run_wmic(cmd_args):
    """Executes a wmic command and parses the output, handling spacing and empty lines correctly."""
    raw = run_cmd(["wmic.exe"] + cmd_args.split())
    if raw:
        lines = []
        for line in raw.splitlines():
            line_str = line.strip()
            if line_str:
                lines.append(line_str)
        # Typically the output format of wmic is:
        # HeaderName
        # Value(s)
        if len(lines) > 1:
            value = "\n".join(lines[1:])
            if value:
                return value
    return None

def read_registry(key_path, value_name):
    """Reads a value from HKEY_LOCAL_MACHINE in the Windows registry (64-bit view)."""
    try:
        key = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            key_path,
            0,
            winreg.KEY_READ | winreg.KEY_WOW64_64KEY
        )
        value, _ = winreg.QueryValueEx(key, value_name)
        winreg.CloseKey(key)
        return str(value).strip()
    except Exception:
        return None

def sanitize_value(val):
    """Cleans hardware parameters and discards generic/placeholder values."""
    if not val:
        return None
    val = val.strip().lower()
    
    generic_patterns = {
        "none", "null", "unknown", "default string", "to be filled by o.e.m.",
        "not specified", "fill by oem", "undefined", "empty", "system product name",
        "to be filled by o.e.m"
    }
    if val in generic_patterns:
        return None
    
    uuid_pattern = re.compile(r'^[0-9a-f\-]+$')
    if uuid_pattern.match(val):
        stripped_uuid = val.replace('-', '')
        if len(set(stripped_uuid)) <= 2:  # E.g., all '0's or all 'f's
            return None
            
    cleaned = "".join(c for c in val if c.isalnum())
    if not cleaned or len(cleaned) < 3:
        return None
    return cleaned

def get_motherboard_uuid():
    """Retrieves the motherboard UUID (Win32_ComputerSystemProduct)."""
    val = run_powershell("(Get-CimInstance Win32_ComputerSystemProduct).Uuid")
    if val: return val
    val = run_wmic("csproduct get uuid")
    return val

def get_disk_serial():
    """Retrieves the serial number of the physical drive associated with the active system partition (typically C:)."""
    # 1. Primary: Get-Partition -DriveLetter C | Get-Disk
    val = run_powershell("Get-Partition -DriveLetter C | Get-Disk | Select-Object -ExpandProperty SerialNumber")
    if val: return val
    
    # 2. Fallback: Get-CimInstance association matching C: drive
    val = run_powershell(
        "$ld = Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\"; "
        "if ($ld) { "
        "  $p = Get-CimAssociatedInstance -InputObject $ld -ResultClassName Win32_DiskPartition; "
        "  if ($p) { "
        "    $dd = Get-CimAssociatedInstance -InputObject $p -ResultClassName Win32_DiskDrive; "
        "    if ($dd) { $dd.SerialNumber } "
        "  } "
        "}"
    )
    if val: return val

    # 3. Fallback: Older WMI association using Get-WmiObject / Get-CimInstance filtering directly
    val = run_powershell(
        "$partitions = Get-CimInstance Win32_DiskPartition; "
        "foreach ($p in $partitions) { "
        "  $logicals = Get-CimAssociatedInstance -InputObject $p -ResultClassName Win32_LogicalDisk; "
        "  if ($logicals | Where-Object { $_.DeviceID -eq 'C:' }) { "
        "    $drives = Get-CimAssociatedInstance -InputObject $p -ResultClassName Win32_DiskDrive; "
        "    if ($drives) { $drives.SerialNumber } "
        "  } "
        "}"
    )
    if val: return val
    
    # 4. Last resort: WMIC index 0
    val = run_wmic("diskdrive where index=0 get serialnumber")
    return val

def get_motherboard_serial():
    """Retrieves the motherboard/baseboard serial number."""
    val = run_powershell("(Get-CimInstance Win32_BaseBoard).SerialNumber")
    if val: return val
    val = run_wmic("baseboard get serialnumber")
    if val: return val
    val = read_registry(r"HARDWARE\DESCRIPTION\System\BIOS", "BaseBoardSerialNumber")
    if val: return val
    return read_registry(r"HARDWARE\DESCRIPTION\System\BIOS", "SystemSerialNumber")

def get_cpu_id():
    """Retrieves the CPU ID/Processor ID."""
    val = run_powershell("(Get-CimInstance Win32_Processor).ProcessorId")
    if val: return val
    return run_wmic("cpu get processorid")

def get_machine_guid():
    """Retrieves the Windows MachineGuid from the registry."""
    return read_registry(r"SOFTWARE\Microsoft\Cryptography", "MachineGuid")

def get_all_mac_addresses():
    """Retrieves all MAC addresses from the system, filtering for physical adapters."""
    macs = []
    cmd = (
        "Get-CimInstance Win32_NetworkAdapter | "
        "Where-Object { $_.MACAddress -ne $null -and $_.PhysicalAdapter -eq $true } | "
        "Select-Object -ExpandProperty MACAddress"
    )
    output = run_powershell(cmd)
    if output:
        macs = [m.strip().replace('-', ':').lower() for m in output.splitlines() if m.strip()]
    
    if not macs:
        wmic_output = run_wmic("nic where physicaladapter=true get macaddress")
        if wmic_output:
            for line in wmic_output.splitlines():
                line = line.strip()
                if line and not line.lower().startswith("macaddress"):
                    found = re.findall(r'([0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2})', line)
                    for m in found:
                        macs.append(m.replace('-', ':').lower())
                        
    if not macs:
        import uuid
        node = uuid.getnode()
        mac = ':'.join(f'{(node >> i) & 0xff:02x}' for i in range(0, 48, 8)[::-1])
        if mac != '00:00:00:00:00:00':
            macs.append(mac)
            
    return list(set(macs))

def get_physical_mac_addresses():
    """Retrieves a list of physical MAC addresses, filtering out virtual interfaces."""
    macs = get_all_mac_addresses()
    vm_prefixes = {"00:05:69", "00:0c:29", "00:50:56", "08:00:27", "00:15:5d", "00:16:3e", "52:54:00", "00:1c:42"}
    return [mac for mac in macs if mac[:8].lower() not in vm_prefixes]

def is_virtual_machine():
    """Checks if the operating environment is a virtual machine."""
    raw_manufacturer = (
        run_powershell("(Get-CimInstance Win32_ComputerSystem).Manufacturer") or 
        run_wmic("computersystem get manufacturer") or 
        read_registry(r"HARDWARE\DESCRIPTION\System\BIOS", "SystemManufacturer")
    )
    raw_model = (
        run_powershell("(Get-CimInstance Win32_ComputerSystem).Model") or 
        run_wmic("computersystem get model") or 
        read_registry(r"HARDWARE\DESCRIPTION\System\BIOS", "SystemProductName")
    )
    manufacturer = sanitize_value(raw_manufacturer)
    model = sanitize_value(raw_model)
    bios_version = sanitize_value(
        run_powershell("(Get-CimInstance Win32_BIOS).Version") or 
        run_wmic("bios get version") or 
        read_registry(r"HARDWARE\DESCRIPTION\System\BIOS", "BIOSVersion")
    )
    
    vm_indicators = ["virtualbox", "vmware", "hyperv", "qemu", "xen", "kvm", "innotek", "parallels", "virtual", "virtualmachine", "vrtual"]
    for ind in vm_indicators:
        if (manufacturer and ind in manufacturer) or \
           (model and ind in model) or \
           (bios_version and ind in bios_version):
            return True, f"System properties match hypervisor: {ind}"
            
    disk_serial = get_disk_serial()
    if disk_serial:
        ds_lower = disk_serial.lower()
        if ds_lower.startswith("vbox") or ds_lower.startswith("prl_") or "vbox" in ds_lower or "vmware" in ds_lower or "qemu" in ds_lower:
            return True, f"Virtual disk serial detected: {disk_serial}"
            
    # VM MAC address prefix check
    all_macs = get_all_mac_addresses()
    physical_macs = get_physical_mac_addresses()
    if all_macs and not physical_macs:
        # Check that system is not a known physical manufacturer brand
        known_brands = ["dell", "hp", "lenovo", "asus", "gigabyte", "msi", "apple", "intel", "amd", "nvidia", "toshiba", "panasonic", "sony", "acer", "samsung"]
        is_known_brand = False
        for brand in known_brands:
            if (raw_manufacturer and brand in raw_manufacturer.lower()) or \
               (raw_model and brand in raw_model.lower()) or \
               (manufacturer and brand in manufacturer) or \
               (model and brand in model):
                is_known_brand = True
                break
        if not is_known_brand:
            vm_prefixes = {"00:05:69", "00:0c:29", "00:50:56", "08:00:27", "00:15:5d", "00:16:3e", "52:54:00", "00:1c:42"}
            for mac in all_macs:
                for prefix in vm_prefixes:
                    if mac.startswith(prefix):
                        return True, f"Virtual Machine MAC prefix detected: {mac}"
                
    return False, "Physical Machine"

def hash_part(val):
    """Generates a 12-character hex slice of the SHA-256 hash of a string."""
    if not val:
        return "000000000000"
    return hashlib.sha256(val.encode('utf-8')).hexdigest()[:12]

def generate_composite_hwid():
    """Gathers and hashes identifiers into a composite HWID string."""
    raw_uuid = sanitize_value(get_motherboard_uuid())
    raw_disk = sanitize_value(get_disk_serial())
    raw_board = sanitize_value(get_motherboard_serial())
    raw_guid = sanitize_value(get_machine_guid())
    raw_cpu = sanitize_value(get_cpu_id())
    
    return f"v1:{hash_part(raw_uuid)}:{hash_part(raw_disk)}:{hash_part(raw_board)}:{hash_part(raw_guid)}:{hash_part(raw_cpu)}"

def verify_hwid_secure(registered_hwid, current_hwid, match_threshold=0.5):
    """
    Validates the current HWID against the registered HWID using weights.
    Resolves WMI spoofing bypasses by:
    - Enforcing a minimum total valid weight (total_valid_weight >= 8) to prevent bypassing via WMI disabling.
    - Requiring at least one major physical component (UUID or Disk Serial) to match if evaluated.
    - Setting the default score match threshold to 0.50 (50%) to tolerate SSD upgrades on custom PCs and SSD + OS upgrades.
    """
    if not registered_hwid.startswith("v1:") or not current_hwid.startswith("v1:"):
        return False, 0.0, False
        
    reg_parts = registered_hwid.split(":")[1:]
    cur_parts = current_hwid.split(":")[1:]
    if len(reg_parts) != 5 or len(cur_parts) != 5:
        return False, 0.0, False
        
    weights = [4, 4, 2, 3, 1]  # UUID, Disk, Board, Guid, CPU
    total_valid_weight = 0
    matched_weight = 0
    needs_update = False
    
    uuid_evaluated = False
    uuid_matched = False
    disk_evaluated = False
    disk_matched = False
    board_evaluated = False
    board_matched = False
    cpu_evaluated = False
    cpu_matched = False
    
    for i in range(5):
        r_part = reg_parts[i]
        c_part = cur_parts[i]
        
        if r_part == "000000000000" or c_part == "000000000000":
            if r_part == "000000000000" and c_part != "000000000000":
                needs_update = True
            continue
            
        weight = weights[i]
        total_valid_weight += weight
        
        if i == 0:
            uuid_evaluated = True
        elif i == 1:
            disk_evaluated = True
        elif i == 2:
            board_evaluated = True
        elif i == 4:
            cpu_evaluated = True
            
        if r_part == c_part:
            matched_weight += weight
            if i == 0:
                uuid_matched = True
            elif i == 1:
                disk_matched = True
            elif i == 2:
                board_matched = True
            elif i == 4:
                cpu_matched = True
        else:
            needs_update = True
            
    # Check 1: Enforce minimum total valid weight
    if total_valid_weight < 8:
        return False, 0.0, False
        
    # Check 2: Require at least one major physical component to match if evaluated
    mboard_matched = uuid_matched or (not uuid_evaluated and board_evaluated and board_matched)
    
    if uuid_evaluated or disk_evaluated or (not uuid_evaluated and board_evaluated) or (not uuid_evaluated and not board_evaluated):
        if not (mboard_matched or disk_matched):
            # Calculate match score for debugging but reject validation
            match_score = matched_weight / total_valid_weight
            return False, match_score, needs_update
            
    match_score = matched_weight / total_valid_weight
    
    # Check 3: Check score threshold
    passed = match_score >= match_threshold
    return passed, match_score, needs_update
```

---

## 3. Database Design

Firestore is organized with a flat collection-to-document architecture. Direct client access is completely blocked (read/write set to `false` in Firestore rules). All interactions are performed by serverless Firebase Cloud Functions running under admin credentials.

```
Firestore Root
├── users (Collection)
│   └── [uid] (Document)
├── tools (Collection)
│   └── [toolId] (Document)
├── licenses (Collection)
│   └── [licenseKey] (Document)
└── activations (Collection)
    └── [activationId] (Document)
```

### 3.1. Collection Schemas

#### Collection: `users`
* **Document ID**: `uid` (String, matches Firebase Auth User ID)
* **Fields**:
  | Field Name | Type | Description |
  | :--- | :--- | :--- |
  | `email` | String | User's primary email address (e.g., `user@bancontentauto.com`). |
  | `displayName` | String | User's name associated with billing. |
  | `role` | String | Privilege level: `"admin"`, `"support"`, or `"customer"`. |
  | `stripeCustomerId` | String | Stripe reference ID for subscription mapping (nullable). |
  | `createdAt` | Timestamp | Timestamp when the user account was registered. |
  | `updatedAt` | Timestamp | Timestamp of the last modifications to the user account. |

#### Collection: `tools`
* **Document ID**: `toolId` (String, unique slug, e.g., `"ban-content"`)
* **Fields**:
  | Field Name | Type | Description |
  | :--- | :--- | :--- |
  | `name` | String | Display name of the product (e.g., `"Ban Content Web Automation"`). |
  | `description` | String | Text description of the tool's capabilities. |
  | `currentVersion` | String | Current stable production version (e.g., `"1.2.0"`). |
  | `downloadUrl` | String | Secure URL where the compiled executable is hosted. |
  | `isActive` | Boolean | Global toggle to enable/disable tool accessibility. |
  | `createdAt` | Timestamp | Timestamp when this tool was registered. |

#### Collection: `licenses`
* **Document ID**: `licenseKey` (String, cryptographically random high-entropy token: `BC-XXXX-XXXX-XXXX`)
* **Fields**:
  | Field Name | Type | Description |
  | :--- | :--- | :--- |
  | `userId` | String | Associated `users.uid` owner (nullable for reseller keys). |
  | `toolId` | String | Associated `tools.toolId` representing the product purchased. |
  | `licenseType` | String | Category: `"monthly"`, `"yearly"`, `"lifetime"`, or `"trial"`. |
  | `status` | String | Lifecycle state: `"active"`, `"suspended"`, or `"expired"`. |
  | `maxActivations` | Number | Maximum concurrent active devices allowed (typically `1`). |
  | `currentActivations`| Number | Cached count of active activations. |
  | `expiresAt` | Timestamp | Date when license expires (nullable for `"lifetime"`). |
  | `createdAt` | Timestamp | Creation timestamp. |
  | `updatedAt` | Timestamp | Last modification timestamp. |
  | `meta` | Map | Extended metadata (e.g., Stripe invoice ID, reseller logs). |

#### Collection: `activations`
* **Document ID**: `activationId` (String, unique hash generated from `licenseKey + hwid` to guarantee uniqueness constraints)
* **Fields**:
  | Field Name | Type | Description |
  | :--- | :--- | :--- |
  | `licenseKey` | String | Parent reference to `licenses.licenseKey`. |
  | `hwid` | String | Physical device composite hardware fingerprint. |
  | `hostname` | String | Machine hostname for customer device identification. |
  | `os` | String | Operating system release version details. |
  | `activatedAt` | Timestamp | Timestamp of initial activation on this device. |
  | `lastCheckedAt` | Timestamp | Timestamp of the last successful validation check. |
  | `ipAddress` | String | Client's last-recorded IP address. |
  | `isActive` | Boolean | True if the device activation is currently valid. |

### 3.2. Indexing Rules
1. **Single-Field Indexes**: Automatically created on all basic document fields.
2. **Composite Indexes**: Required by Firestore to perform complex queries:
   * Collection: `activations` | Fields: `licenseKey` (Ascending) + `isActive` (Ascending)
     * *Purpose*: Accelerates backend counts of active instances for device limit validation during `/activate` calls.
   * Collection: `licenses` | Fields: `userId` (Ascending) + `status` (Ascending)
     * *Purpose*: Powers customer dashboards query checking all valid licenses owned by a specific user.

### 3.3. PowerShell Environment-Variable Parameterization (Avoiding Switch Parser Crash)
During update operations, the client app may execute from directories or temp paths containing single quotes (e.g., `C:\Users\Bao's PC\AppData\Local\...`). In PowerShell, if arguments or commands are enclosed in single quotes and directly interpolated inside a `-Command` string, any single quote in the path will prematurely terminate the literal string. This causes syntax errors, terminating update execution and crashing the process.

Furthermore, passing custom CLI switches (like `-current`, `-old`, `-new`) to powershell.exe fails due to switch parser and parameter binding restrictions. To solve both issues, pass variables to the detached process using environment variables (`env` argument of `subprocess.Popen`). In the PowerShell script block, retrieve them using `$env:UPDATE_CURRENT`, `$env:UPDATE_OLD`, and `$env:UPDATE_NEW`. This prevents syntax errors and binding crashes entirely.

```python
import os
import subprocess

# Prepare environment variables for the detached process to avoid CLI parameter binding issues
env = os.environ.copy()
env["UPDATE_CURRENT"] = current_exe
env["UPDATE_OLD"] = old_exe
env["UPDATE_NEW"] = temp_file_path

ps_args = [
    "powershell.exe",
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    "Start-Sleep -Seconds 2; "
    "if (Test-Path $env:UPDATE_OLD) { Remove-Item -Path $env:UPDATE_OLD -Force }; "
    "Move-Item -Path $env:UPDATE_CURRENT -Destination $env:UPDATE_OLD -Force; "
    "Move-Item -Path $env:UPDATE_NEW -Destination $env:UPDATE_CURRENT -Force; "
    "Start-Process $env:UPDATE_CURRENT"
]

# Spawns background updater safely avoiding switch and single-quote issues
subprocess.Popen(
    ps_args,
    env=env,
    creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS
)
```

### 3.4. Windows DLL Locking & Deletion Bypasses (PermissionError)
Windows enforces strict file-locking behavior on loaded binaries. When the application's core `.pyd` module (which is a native DLL under the hood) is dynamically loaded into memory using `importlib`, the operating system puts a read/execute lock on the `.pyd` file on disk. Consequently, attempting to delete the `.pyd` file immediately after import (as described in the execution flow) will raise a `PermissionError` (Windows Error 5 or 32) and fail.

> **WARNING**: Standard Python `atexit` handlers fail to delete loaded `.pyd` modules because Windows locks loaded dynamic libraries until the process has completely terminated. Since `atexit` executes within the context of the running Python process prior to DLL unload, any attempt to delete the active `.pyd` file at this stage will result in a `PermissionError`.

To resolve this limitation while preserving security, the client must employ alternative strategies:
1. **Startup-Phase Orphan Cleanup**: Keep temporary `.pyd` files within a designated application directory under `%TEMP%` or `%APPDATA%`. During the application's startup routine—prior to importing any modules—scan this directory and delete all orphaned `.pyd` files from previous sessions. This is highly reliable and handles cleanup cleanly.
2. **Detached Cleanup Process**: Spawn a lightweight, detached background helper process (e.g. via PowerShell or a Python sub-launcher) that waits for the main Python process to exit (using its PID) and then deletes the temporary `.pyd` files.
3. **Delayed Reboot-Time Deletion (Fallback)**: Call the native Windows API `MoveFileEx` via `ctypes` with the `MOVEFILE_DELAY_UNTIL_REBOOT` flag. This registers the file with the OS to be deleted on the next reboot.

---

## 4. License API Lifecycle & Security

### 4.1. Text-Based API Lifecycle Flowcharts

#### Phase 1: Purchase and Key Generation
```
+-------------+         Webhook         +--------------------+         Create Key         +---------------+
| Stripe/Cart | ----------------------> | Firebase API (CF)  | -------------------------> | Firestore DB  |
+-------------+                         | Generate BC-XXXX   |                            +---------------+
                                        +--------------------+
                                                  |
                                                  | Send License Key
                                                  v
                                           +--------------+
                                           | User's Email |
                                           +--------------+
```

#### Phase 2: Initial Activation (`/activate`)
```
+------------+                                            +--------------------+            +--------------+
| Client App | ── 1. Read Hardware IDs & generate nonce ─► |                    |            |              |
|            |                                            | Firebase API (CF)  | ─────────► | Firestore DB |
|            | ── 2. POST /activate {license, hwid, ...} ─► |                    | ◄────────  |              |
+------------+                                            +--------------------+            +--------------+
      ▲                                                             │
      │                                                             │ 3. Query license status & active count.
      │                                                             │    If OK, write activation & sign token.
      │                                                             ▼
      └───────── 4. Return signed JWT activation token ─────────────┘
```

#### Phase 3: Subsequent Launches (`/verify` Heartbeat)
```
+------------+                                                                     +--------------------+
| Client App | ── 1. Load local JWT token & verify signature offline ────────────► |                    |
|            |                                                                     | Firebase API (CF)  |
|            | ── 2. If token valid & grace active, launch app immediately.       |                    |
|            | ── 3. (Optional) Run online POST /verify {token, license, nonce} ─► |                    |
+------------+                                                                     +--------------------+
      ▲                                                                                      │
      │                                                                                      │ 4. Check status.
      │                                                                                      │    Return new JWT.
      │                                                                                      ▼
      └───────── 5. Update local token & execute app payload ────────────────────────────────┘
```

---

### 4.2. Security Architecture

#### A. Mitigating Replay Attacks
* **Threat**: An attacker captures a successful API validation response from the network and replays it to run the application offline or bypass server validation on another computer.
* **Mitigation**: Ephemeral Client Nonce. The client generates a cryptographically secure random 16-byte value (`nonce`) for every request. The server verifies the license and signs the nonce inside the payload of a JWT. When the client validates the returned signature, it asserts that the signature is valid and the embedded `nonce` exactly matches the local random value generated for that session. Stale captured responses will contain an old nonce and will be rejected.

#### B. Defeating DNS Spoofing, Redirects & Hosts File Redirection
* **Threat**: An attacker modifies the local hosts file (redirecting the verification host to `127.0.0.1`) and builds a dummy mock server to return `{"status": "active"}`.
* **Mitigation**: SSL Certificate Pinning and Asymmetric Digital Signatures.
  1. **Subject Public Key Info (SPKI) Pinning**: The client enforces certificate pinning by validating that the server's TLS certificate matches a hardcoded Subject Public Key Info (SPKI) SHA-256 fingerprint. This is preferred over leaf certificate pinning because SPKI pinning does not break when certificates are renewed (every 90 days), provided the developer's public key remains the same, maintaining high availability and strong MITM protection.
  2. **Asymmetric Key Verification**: The server signs all verification payloads with a private Ed25519 key. The corresponding public key is hardcoded inside the obfuscated client binary. Even if the network is redirected, a spoofed local server cannot sign responses with the developer's private key, failing client-side validation.

#### C. Preventing Client-Side Code Patching (Cracking)
* **Threat**: An attacker decompiles the Python script, patches the checks (e.g., changes `if not check_license():` to `if True:`), or hooks Python's dynamic runtime `exec(plaintext_code)` statement to dump the decrypted source.
* **Mitigation**: **Dynamic compiled module decryption and HWID-derived local key encryption**.
  1. **Dynamic Module Decryption**: Core modules (e.g. key engines, core loop) are compiled into native `.pyd` (DLL) binary extension modules using Cython/Nuitka (removing all Python bytecode and decompilability). The compiled files are AES-256 encrypted and stored in the distribution package.
  2. **HWID-derived Local Encryption**: The decryption key is delivered inside the verified, signed JWT response payload. The client **never stores the AES decryption key in plaintext** inside the JWT or on disk. Instead, the client encrypts the AES decryption key locally using a key derived from the client's own hardware signature (e.g. `PBKDF2(HWID, salt, iterations)`). This local encrypted bundle is saved.
  3. **Runtime Loading & Post-Execution Deletion**: At runtime, the client decrypts the AES key using the derived HWID key, decrypts the `.pyd` module, writes it to a temporary path, and imports it dynamically using `importlib`. Because Windows locks the `.pyd` file in memory, preventing immediate deletion (which would trigger a `PermissionError`), standard python `atexit` handlers will fail since the library is still loaded. Therefore, the client must employ alternative cleanup strategies such as performing a cleanup of orphaned temp modules during the startup phase of the next application run, or spawning a detached helper cleanup process that waits for the main python process to exit before deleting (see Section 3.4 for full details).
  4. **Fail-Secure**: If an attacker copies the token/license bundle to another machine, the derived key from the new machine's HWID will be different, making it impossible to decrypt the AES key and run the application. If they patch the validation check, the decryption key is never generated, leading to an immediate crash.

#### D. Preventing Clock Rollback Bypasses
* **Threat**: An attacker rolls back their local system clock to bypass license expiration and run expired software indefinitely.
* **Mitigation**: **Monotonic Time & HTTP Network Time Checking**.
  1. **Monotonic Verification**: The client stores the `lastCheckedAt` timestamp inside the signed JWT. During validation, the client asserts that the current local system clock is greater than or equal to `lastCheckedAt`. If the local system clock is prior to `lastCheckedAt`, a clock rollback is detected and the license is flagged as invalid.
  2. **Trusted Network Time**: When online, the client retrieves the trusted current time from TLS connection headers (specifically, parsing the `Date` HTTP header from responses to Google or Firebase services) to perform validation, ignoring the local system clock.
  3. **Local Monotonic Tracking**: When offline, the client logs the current system timestamp in an encrypted local configuration/registry key on every run. If the system clock at startup is older than the last recorded time, the application locks down.

---

### 4.3. Client Security Python Implementation

#### SPKI Pinning Implementation
```python
import ssl
import sys
import requests
import hashlib
import urllib3
import urllib3.connectionpool
from urllib3.connection import HTTPSConnection
from urllib3.poolmanager import PoolManager, ProxyManager
from requests.adapters import HTTPAdapter
from cryptography import x509
from cryptography.hazmat.primitives import serialization
from urllib3.exceptions import SSLError

# Hardcoded SHA-256 hash of the server's Subject Public Key Info (SPKI)
PINNED_SPKI_HASH = "8f4c28b5e28a50de48fcbb15e12f0e08b1a80477bf27a3c3f9189c4d284a6c8e"

class PinnedHTTPSConnection(HTTPSConnection):
    def connect(self):
        super().connect()
        try:
            der_cert = self.sock.getpeercert(binary_form=True)
            cert_obj = x509.load_der_x509_certificate(der_cert)
            pub_key = cert_obj.public_key()
            spki_bytes = pub_key.public_bytes(
                encoding=serialization.Encoding.DER,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            spki_hash = hashlib.sha256(spki_bytes).hexdigest()
            if spki_hash != PINNED_SPKI_HASH:
                raise ssl.SSLError(f"SPKI Pinning Validation Failed! Expected {PINNED_SPKI_HASH}, got {spki_hash}")
        except Exception as e:
            self.close()
            raise ssl.SSLError(f"SSL SPKI verification failed: {e}")

class PinnedHTTPSConnectionPool(urllib3.connectionpool.HTTPSConnectionPool):
    ConnectionCls = PinnedHTTPSConnection

class PinnedPoolManager(PoolManager):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pool_classes_by_scheme["https"] = PinnedHTTPSConnectionPool

class SPKIPinnedCertificateAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = ssl.create_default_context()
        context.verify_mode = ssl.CERT_REQUIRED
        context.check_hostname = True
        kwargs["ssl_context"] = context
        self.poolmanager = PinnedPoolManager(*args, **kwargs)

    def proxy_manager_for(self, proxy, **proxy_kwargs):
        if proxy in self.proxy_manager:
            return self.proxy_manager[proxy]
        manager = super().proxy_manager_for(proxy, **proxy_kwargs)
        manager.pool_classes_by_scheme["https"] = PinnedHTTPSConnectionPool
        self.proxy_manager[proxy] = manager
        return manager

def call_secure_licensing_api(url, payload):
    if not url.lower().startswith("https://"):
        raise ValueError("Enforce HTTPS: Connection must be secure (HTTPS)")
    session = requests.Session()
    session.mount("https://", SPKIPinnedCertificateAdapter())
    try:
        response = session.post(url, json=payload, timeout=10, allow_redirects=False)
        return response.json()
    except (SSLError, requests.exceptions.SSLError) as e:
        print("SECURITY EXCEPTION: TLS SPKI Pinning Check Failed! Potential MITM detected.", file=sys.stderr)
        raise e
    except Exception as e:
        print(f"Network Connection Error: {e}", file=sys.stderr)
        raise e
```

#### Ed25519 Digital Signature Verification
```python
import base64
import json
import sys
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.exceptions import InvalidSignature

# Embedded developer public key (base64-encoded)
PUBLIC_KEY_B64 = "MCowBQYDK2VwAyEAd5ZGl9k7b0fVp794dYd5a/LwR0s5V22jHh6gN3Z8oQ4="

def verify_server_signature(payload_json, signature_b64):
    """Verifies that the server payload was signed with the developer's private key."""
    try:
        pub_key_bytes = base64.b64decode(PUBLIC_KEY_B64)
        public_key = ed25519.Ed25519PublicKey.from_public_bytes(pub_key_bytes)
        
        signature_bytes = base64.b64decode(signature_b64)
        public_key.verify(signature_bytes, payload_json.encode('utf-8'))
        return True
    except InvalidSignature:
        print("SECURITY EXCEPTION: Invalid digital signature. Response tampered with!", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Cryptographic verification error: {e}", file=sys.stderr)
        return False
```

### 4.4. Crucial Security & Architectural Vulnerability Remediation (R4 Updates)

1. **Silent Bypass of SPKI Pinning & Runtime Monkeypatching**:
   * *Finding*: Overriding `cert_verify` in a custom `HTTPAdapter` can silently fail or skip verification because `conn.sock` is sometimes `None` when called, bypassing SPKI checks. Furthermore, client-side TLS/SPKI pinning can be easily monkeypatched or bypassed at runtime (e.g., using Frida or modifying the binary).
   * *Remedy*: Override `urllib3.connection.HTTPSConnection` to perform the SPKI check inside its `connect` method to guarantee socket validation. Crucially, recognize that the core security boundary is **Application-Layer Signature Verification** (Ed25519) on the payload itself, which makes TLS pinning a defense-in-depth extra rather than a single point of bypass.

2. **Google Cloud/Firebase Key Rotation Conflict & CA Pinning Risks**:
   * *Finding*: Pinning a static leaf SPKI hash on Google Cloud or Firebase hosts causes client outages when Google rotates edge certificates and public keys automatically. Pinning intermediate or root CAs (CA Pinning) resolves this but must be handled carefully.
   * *Remedy*: Route licensing API traffic through a developer-controlled reverse proxy gateway where key rotation is managed centrally, or pin intermediate/root CAs. Note that CA pinning (intermediate/root) is secure against DNS spoofing/host redirection due to hostname checking (`check_hostname=True`), which prevents attackers from using certificates issued to `attacker.com` for `api.ourdomain.com`. However, intermediate key rotation still poses a long-term stability risk.

3. **Cleartext DLL/pyd Temp Directory Exposure & Memory Loading**:
   * *Finding*: Loaded `.pyd` files are locked on Windows, remaining on disk during runtime. Since loaded DLLs are readable on disk (e.g. copied from `%TEMP%`), attackers can extract the decrypted modules and bypass the launcher wrapper.
   * *Remedy*: Perform a secondary hardware verification check *inside* the native compiled C++ code of the `.pyd` module. To prevent temp directory exposure, developers sometimes consider using memory-only DLL loaders (such as `memimport`). However, `memimport` is highly fragile in Python 3.10+ on Windows due to Arbitrary Code Guard (ACG) and Antivirus heuristics. Since process memory dumping bypasses memory loading anyway, recommending secondary C++ hardware checks is the most stable and secure mitigation.

4. **Offline HWID Upgrades Break PBKDF2**:
   * *Finding*: Deriving a local decryption key using the composite HWID via PBKDF2 fails during offline hardware upgrades due to avalanche effects.
   * *Remedy*: Storing keys encrypted under individual components is insecure because it collapses entropy to the CPU ID. Furthermore, Windows DPAPI does not protect secrets against the local user (the user can decrypt them easily using their own session credentials) and DPAPI keys do not survive clean OS reinstalls. Therefore, Shamir's Secret Sharing is recommended as the only secure threshold-based option for offline upgrades, allowing the system to tolerate minor changes without losing access to the decryption keys.

5. **Dynamic Namespace Monkeypatching**:
   * *Finding*: Python's dynamic runtime environment allows attackers to hijack or monkeypatch built-in classes, modules, or functions (e.g., overriding `requests.Session.post` or the `ssl` module) to bypass pinning and verification logic.
   * *Remedy*: Build integrity verification checks. Vital security operations and verification routines should be written in native C++ extension modules (compiled via Nuitka or Cython), preventing Python-level hook intervention. Additionally, use runtime signature/checksum scans of imported module files (`sys.modules` scanning and hashes) and namespace protection/obfuscation tools to restrict access to core modules.

6. **Domain Fronting Attacks**:
   * *Finding*: Domain fronting permits attackers to redirect licensing traffic by specifying a permitted host name in the SNI/TLS header while routing the HTTP Host header to a malicious/custom server.
   * *Remedy*: Enforce strict server name validation by verifying that the resolved destination IP's TLS certificate Subject Alternative Name (SAN) or Common Name (CN) matches the trusted host domain. The adapter must block mismatching SNI and Host headers, preventing connection hijacking through fronting techniques.
```
---

## 5. Obfuscation Tools Comparison

Desktop code security requires compiling Python down to a state that is difficult to reverse-engineer.

| Tool | Protection Mechanism | Security Level | Build Complexity | Licensing Cost | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Nuitka** | Translates Python source code to C++ and compiles to native machine binaries (`.exe`/`.pyd`). | **Very High** | **High** (Requires C++ compiler setup MSVC/MinGW) | - Community: Free (Apache 2.0)<br>- Commercial: ~€250/yr | - No bytecode remaining to decompile.<br>- Compiles directly to native code.<br>- Significant runtime speed optimizations. | - Long compilation times.<br>- Larger output binary sizes.<br>- Dynamic tracebacks are harder to debug. |
| **PyArmor** | Encrypts Python bytecode and decrypts function-by-function in memory at runtime via dynamic wrappers. | **High** | **Medium** (Integrates with PyInstaller CLI) | - Trial: Free (restricted)<br>- Pro: ~$109 (one-time)<br>- Enterprise: ~$299 | - Direct integration for license validation, expiration and HWID check commands. | - Closed-source core runtime.<br>- High frequency of antivirus false positives.<br>- Performance cost in deep loops. |
| **Cython** | Compiles specific Python modules (`.py`/`.pyx`) into native C extension modules (`.pyd` DLLs). | **Very High** | **Very High** (Requires setup scripts and linker commands) | **Free** (BSD License) | - Allows modular protection (compile core licensing logic, keep UI in Python). | - Not a packaging tool; requires PyInstaller to package into a single `.exe`. |
| **PyObfuscate / Minifiers** | Strips comments, renames variables, and wraps code inside runtime string `exec` wrappers. | **Low** | **Low** (Simple pre-processing step) | **Free** | - Cross-platform.<br>- Zero external compilation toolchain dependencies. | - Extremely easy to bypass by intercepting/dumping target `exec` outputs. |

### Strategic Recommendation
1. **Primary Recommendation: Nuitka**. Nuitka provides the highest security barrier by compiling Python directly into native C++ code. The resulting `.exe` binary contains no Python bytecode, rendering standard tools like `pycdc` or `uncompyle6` completely useless. An attacker must perform native machine assembly analysis in IDA Pro or Ghidra, raising the difficulty level to that of standard native software cracking.
2. **Dynamic Load Protections**: We strongly advise against raw execution of python scripts using `exec(plaintext_code)`. To achieve maximum runtime protection, the application's core operational logic should be compiled into binary `.pyd` DLL extensions using Nuitka/Cython and encrypted. During authorization verification, the decrypted `.pyd` is written to a dynamic temporary path, loaded using standard Python import libraries, and immediately deleted from the filesystem to minimize exposure.

---

## 6. Over-The-Air (OTA) Updates

### 6.1. Update Check Protocol & Manifest
Updates are published to a CDN/cloud storage bucket consisting of the compiled binaries and a JSON manifest signed by the developer.

#### Manifest Schema (`update_manifest.json`)
```json
{
  "latest_version": "1.2.0",
  "min_required_version": "1.0.0",
  "release_date": "2026-06-22T00:00:00Z",
  "changelog": "Fixed minor licensing bugs and improved rendering speed.",
  "binaries": {
    "windows-x64": {
      "url": "https://updates.bancontentauto.com/downloads/v1.2.0/ban_content.exe",
      "sha256": "8f4c28b5e28a50de48fcbb15e12f0e08b1a80477bf27a3c3f9189c4d284a6c8e",
      "signature": "MC0CFQC8N2p2M2k4d2o5bDRzN3I2cThzOWwwY2QxZDVlNmY3Z2g4ajBrbDJtM240bDVwNnE3cjhzOXQwY2QxZDU="
    }
  }
}
```

---

### 6.2. OTA Verification and Swap Flowchart
```
  [Client Starts]
         │
         ▼
  [Fetch manifest]
         │
         ▼
  [Version check: local < latest?] ── (No) ──► [Normal App Startup]
         │
        (Yes)
         ▼
  [Download new binary to %TEMP%]
         │
         ▼
  [Verify SHA-256 and Ed25519 signature] ── (Fail) ──► [Abort & Alert User]
         │
        (Pass)
         ▼
  [Spawn detached PowerShell script passing TEMP update path]
         │
         ▼
  [Exit Client Process]
         │
         ▼
  [PowerShell handles renaming from TEMP, startup of new binary & cleanup]
```

---

### 6.3. Client Verification & Swap Code
The client downloads the updated binary to `%TEMP%`, validates its SHA-256 integrity, verifies its cryptographic source using a hardcoded public key, and executes the replacement. Since Windows locks running executables, the swap is handled using a detached, background PowerShell command. To prevent syntax errors, parameter binding exceptions, and shell crashes when paths contain single quotes or custom switches, parameters are passed to the PowerShell environment using environment variables via the `env` parameter of Python's `subprocess.Popen` (see Section 3.3 for details).

```python
import os
import sys
import hashlib
import base64
import subprocess
from cryptography.hazmat.primitives.asymmetric import ed25519

DEVELOPER_PUBLIC_KEY = "e2d86c75abf1a8c3d9ef429b5a01d68305c6d59b20ee7a12b450123456793a8d"  # Realistic hex public key

def verify_download(temp_file_path, manifest_entry):
    """Verifies SHA-256 integrity and Ed25519 signature of the downloaded binary."""
    # 1. SHA-256 Check
    sha256_hash = hashlib.sha256()
    with open(temp_file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
            
    if sha256_hash.hexdigest() != manifest_entry["sha256"]:
        print("Checksum verification failed.")
        return False

    # 2. Asymmetric Signature Check
    try:
        pub_key_bytes = bytes.fromhex(DEVELOPER_PUBLIC_KEY)
        public_key = ed25519.Ed25519PublicKey.from_public_bytes(pub_key_bytes)
        signature = base64.b64decode(manifest_entry["signature"])
        
        with open(temp_file_path, "rb") as f:
            file_content = f.read()
            
        public_key.verify(signature, file_content)
        return True
    except Exception as e:
        print(f"Signature check failed: {e}")
        return False

def apply_update_and_restart(temp_file_path):
    """Detaches and spawns background PowerShell commands to swap out the active binary using environment variables."""
    current_exe = sys.executable
    install_dir = os.path.dirname(current_exe)
    old_exe = os.path.join(install_dir, "ban_content.exe.old")
    
    # Prepare environment variables for the detached process to avoid CLI parameter binding issues
    env = os.environ.copy()
    env["UPDATE_CURRENT"] = current_exe
    env["UPDATE_OLD"] = old_exe
    env["UPDATE_NEW"] = temp_file_path
    
    ps_args = [
        "powershell.exe",
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "Start-Sleep -Seconds 2; "
        "if (Test-Path $env:UPDATE_OLD) { Remove-Item -Path $env:UPDATE_OLD -Force }; "
        "Move-Item -Path $env:UPDATE_CURRENT -Destination $env:UPDATE_OLD -Force; "
        "Move-Item -Path $env:UPDATE_NEW -Destination $env:UPDATE_CURRENT -Force; "
        "Start-Process $env:UPDATE_CURRENT; "
        "Start-Sleep -Seconds 3; "
        "if (Test-Path $env:UPDATE_OLD) { Remove-Item -Path $env:UPDATE_OLD -Force }"
    ]
    
    # Spawns background updater shell safely using environment variables and avoiding switch parameter binding
    subprocess.Popen(
        ps_args,
        env=env,
        creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS
    )
    sys.exit(0)
```

---

### 6.4. Rollback and Fault Recovery
1. **Application Watchdog**: When starting a newly updated application, the client runs basic startup and configuration checks. If it runs successfully for more than 5 seconds without crashing, it writes `{"update_status": "success"}` to a local `config.json` file.
2. **Reversion Process**: If the application crashes on boot or exits with an error code before the watchdog writes the success flag, a simple bootstrap launcher checks the `config.json` state. If a crash loop is detected, it automatically restores the backup file `ban_content.exe.old` back to `ban_content.exe` and logs the recovery details. This prevents broken updates from permanently locking out users.
