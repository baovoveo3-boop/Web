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

def run_scenarios():
    scenarios = [
        {
            "name": "Scenario 0: Baseline (All Match)",
            "reg": "v1:uuid11111111:disk11111111:board1111111:guid11111111:cpu111111111",
            "cur": "v1:uuid11111111:disk11111111:board1111111:guid11111111:cpu111111111",
            "expected_pass": True,
            "expected_score": 1.0,
            "expected_update": False
        },
        {
            "name": "Scenario 1: OS Update (MachineGuid changes)",
            "reg": "v1:uuid11111111:disk11111111:board1111111:guid11111111:cpu111111111",
            "cur": "v1:uuid11111111:disk11111111:board1111111:guid22222222:cpu111111111",
            "expected_pass": True,
            "expected_score": 11/14,
            "expected_update": True
        },
        {
            "name": "Scenario 2: SSD Upgrade (Disk serial changes)",
            "reg": "v1:uuid11111111:disk11111111:board1111111:guid11111111:cpu111111111",
            "cur": "v1:uuid11111111:disk22222222:board1111111:guid11111111:cpu111111111",
            "expected_pass": True,
            "expected_score": 10/14,
            "expected_update": True
        },
        {
            "name": "Scenario 3: SSD Upgrade + Windows Reinstall (Both change)",
            "reg": "v1:uuid11111111:disk11111111:board1111111:guid11111111:cpu111111111",
            "cur": "v1:uuid11111111:disk22222222:board1111111:guid22222222:cpu111111111",
            "expected_pass": True, # Tolerated at 0.50 threshold because UUID matches!
            "expected_score": 7/14,
            "expected_update": True
        },
        {
            "name": "Scenario 4: Attacker Clones System (Copy Registry Guid, Same CPU Model)",
            "reg": "v1:uuid11111111:disk11111111:board1111111:guid11111111:cpu111111111",
            "cur": "v1:uuid22222222:disk22222222:board2222222:guid11111111:cpu111111111",
            "expected_pass": False,
            "expected_score": 4/14,
            "expected_update": True
        },
        {
            "name": "Scenario 5.1: Missing Motherboard UUID - OS Update",
            "reg": "v1:000000000000:disk11111111:board1111111:guid11111111:cpu111111111",
            "cur": "v1:000000000000:disk11111111:board1111111:guid22222222:cpu111111111",
            "expected_pass": True,
            "expected_score": 7/10,
            "expected_update": True
        },
        {
            "name": "Scenario 5.2: Missing Motherboard UUID - SSD Upgrade",
            "reg": "v1:000000000000:disk11111111:board1111111:guid11111111:cpu111111111",
            "cur": "v1:000000000000:disk22222222:board1111111:guid11111111:cpu111111111",
            "expected_pass": True, # Now passes because Motherboard Serial acts as surrogate!
            "expected_score": 6/10,
            "expected_update": True
        },
        {
            "name": "Scenario 5.3: Missing Motherboard UUID - SSD + OS Upgrade",
            "reg": "v1:000000000000:disk11111111:board1111111:guid11111111:cpu111111111",
            "cur": "v1:000000000000:disk22222222:board1111111:guid22222222:cpu111111111",
            "expected_pass": False,
            "expected_score": 3/10,
            "expected_update": True
        },
        {
            "name": "Scenario 5.4: Custom PC (UUID & Board Serial Missing) - OS Update",
            "reg": "v1:000000000000:disk11111111:000000000000:guid11111111:cpu111111111",
            "cur": "v1:000000000000:disk11111111:000000000000:guid22222222:cpu111111111",
            "expected_pass": True,
            "expected_score": 5/8,
            "expected_update": True
        },
        {
            "name": "Scenario 5.5: Custom PC (UUID & Board Serial Missing) - SSD Upgrade",
            "reg": "v1:000000000000:disk11111111:000000000000:guid11111111:cpu111111111",
            "cur": "v1:000000000000:disk22222222:000000000000:guid11111111:cpu111111111",
            "expected_pass": False,
            "expected_score": 4/8,
            "expected_update": True
        },
        {
            "name": "Scenario 5.6: Severe WMI Corruption (Only MachineGuid valid) - OS Update",
            "reg": "v1:000000000000:000000000000:000000000000:guid11111111:000000000000",
            "cur": "v1:000000000000:000000000000:000000000000:guid22222222:000000000000",
            "expected_pass": False, # Fails because total weight 3 < 8
            "expected_score": 0.0,
            "expected_update": False
        },
        {
            "name": "Scenario 5.7: Severe WMI Corruption - Attacker Clones (Guid copied)",
            "reg": "v1:000000000000:000000000000:000000000000:guid11111111:000000000000",
            "cur": "v1:000000000000:000000000000:000000000000:guid11111111:000000000000",
            "expected_pass": False, # Fails because total weight 3 < 8
            "expected_score": 0.0,
            "expected_update": False
        }
    ]

    print("=" * 80)
    print("HWID MATCHING LOGIC SIMULATION RUN")
    print("=" * 80)
    
    passed_all = True
    for s in scenarios:
        passed, score, needs_update = verify_hwid_secure(s["reg"], s["cur"])
        actual_pass = passed
        is_score_ok = abs(score - s["expected_score"]) < 1e-5
        is_update_ok = needs_update == s["expected_update"]
        status = "PASS" if (actual_pass == s["expected_pass"] and is_score_ok and is_update_ok) else "FAIL (Unexpected Outcome)"
        if not (actual_pass == s["expected_pass"] and is_score_ok and is_update_ok):
            passed_all = False
            
        print(f"Name:   {s['name']}")
        print(f"Reg:    {s['reg']}")
        print(f"Cur:    {s['cur']}")
        print(f"Score:  {score:.4f} (Expected Score: {s['expected_score']:.4f})")
        print(f"Passed: {actual_pass} (Expected Pass: {s['expected_pass']})")
        print(f"Update: {needs_update} (Expected Update: {s['expected_update']})")
        print(f"Status: {status}")
        print("-" * 80)
        
        # Enforce exact assertions
        assert passed == s["expected_pass"], f"Assertion failed for {s['name']}: pass mismatch (got {passed}, expected {s['expected_pass']})"
        assert abs(score - s["expected_score"]) < 1e-5, f"Assertion failed for {s['name']}: score mismatch (got {score}, expected {s['expected_score']})"
        assert needs_update == s["expected_update"], f"Assertion failed for {s['name']}: update mismatch (got {needs_update}, expected {s['expected_update']})"
        
    print(f"Overall Simulation Check: {'ALL MATCHED' if passed_all else 'DIVERGENCE DETECTED'}")
    return passed_all

def main():
    print("=" * 80)
    print("REAL MACHINE HARDWARE EXTRACTION")
    print("=" * 80)
    
    uuid_raw = get_motherboard_uuid()
    disk_raw = get_disk_serial()
    board_raw = get_motherboard_serial()
    guid_raw = get_machine_guid()
    cpu_raw = get_cpu_id()
    
    print(f"Raw Motherboard UUID:      {uuid_raw}")
    print(f"Raw Disk Serial:           {disk_raw}")
    print(f"Raw Board Serial:          {board_raw}")
    print(f"Raw MachineGuid:           {guid_raw}")
    print(f"Raw CPU ID:                {cpu_raw}")
    print("-" * 80)
    
    print(f"Sanitized UUID:            {sanitize_value(uuid_raw)}")
    print(f"Sanitized Disk Serial:     {sanitize_value(disk_raw)}")
    print(f"Sanitized Board Serial:    {sanitize_value(board_raw)}")
    print(f"Sanitized MachineGuid:     {sanitize_value(guid_raw)}")
    print(f"Sanitized CPU ID:          {sanitize_value(cpu_raw)}")
    print("-" * 80)
    
    composite_hwid = generate_composite_hwid()
    print(f"Generated Composite HWID:  {composite_hwid}")
    
    is_vm, vm_reason = is_virtual_machine()
    print(f"Virtual Machine Detected:  {is_vm} ({vm_reason})")
    
    all_macs = get_all_mac_addresses()
    physical_macs = get_physical_mac_addresses()
    print(f"All MAC Addresses:         {all_macs}")
    print(f"Physical MAC Addresses:    {physical_macs}")
    print("-" * 80)
    
    sim_passed = run_scenarios()
    
    if not sim_passed:
        print("ERROR: Some simulation scenarios did not match expected outcomes!", file=sys.stderr)
        sys.exit(1)
    else:
        print("All simulation scenarios passed successfully.")
        sys.exit(0)

if __name__ == "__main__":
    main()
