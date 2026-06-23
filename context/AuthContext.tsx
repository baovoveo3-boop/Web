"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// Dữ liệu mở rộng lưu trong Firestore
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  walletBalance: number;
  currentTier: string;
  tierExpiresAt: string | null;
  role: "user" | "admin" | "super_admin";
  purchasedProducts?: { id: string; expiresAt: string | null }[];
  webDevices?: { deviceId: string; userAgent: string; lastActive: any }[];
  maxWebDevices?: number;
  pcDevices?: { hwid: string; deviceName: string; lastActive: any }[];
  maxPcDevices?: number;
  createdAt: any;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: any = null;

    // Lắng nghe sự kiện đăng nhập/đăng xuất từ Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Kiểm tra và khởi tạo document bằng getDoc (an toàn hơn, không bị ảnh hưởng bởi cache local)
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            // Nếu user mới tinh (VD: đăng nhập bằng Google lần đầu), tạo Document mới
            const newUserData: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "User",
              walletBalance: 0,
              currentTier: "free",
              tierExpiresAt: null,
              role: "user",
              purchasedProducts: [],
              webDevices: [],
              maxWebDevices: 1,
              pcDevices: [],
              maxPcDevices: 1,
              createdAt: serverTimestamp(),
            };
            try {
              await setDoc(userDocRef, newUserData);
            } catch (e) {
              console.warn("Could not create user document", e);
            }
          }

          // Lắng nghe dữ liệu mở rộng từ Firestore theo thời gian thực
          unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const existingData = docSnap.data() as UserData;
              setUserData(existingData);
              setLoading(false);
            }
          });
        } else {
          setUser(null);
          setUserData(null);
          if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const registerWebDevice = async (userUid: string, maxWebDevices: number, currentWebDevices: any[]) => {
  if (typeof window === 'undefined') return { success: true };
  
  let deviceId = localStorage.getItem('bt_web_device_id');
  if (!deviceId) {
    deviceId = 'web-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('bt_web_device_id', deviceId);
  }
  
  const isKnown = currentWebDevices.some(d => d.deviceId === deviceId);
  if (!isKnown) {
    if (currentWebDevices.length >= maxWebDevices) {
      return { success: false, error: `Bạn đã đạt giới hạn ${maxWebDevices}/${maxWebDevices} thiết bị Web để xem Khóa học. Vui lòng liên hệ Support để giải quyết.` };
    }
    const newDevice = {
      deviceId,
      userAgent: navigator.userAgent,
      lastActive: new Date().toISOString()
    };
    const updated = [...currentWebDevices, newDevice];
    await setDoc(doc(db, "users", userUid), { webDevices: updated }, { merge: true });
    return { success: true, updated };
  } else {
    // Cập nhật lastActive
    const updated = currentWebDevices.map(d => 
      d.deviceId === deviceId ? { ...d, lastActive: new Date().toISOString() } : d
    );
    await setDoc(doc(db, "users", userUid), { webDevices: updated }, { merge: true });
    return { success: true, updated };
  }
};
