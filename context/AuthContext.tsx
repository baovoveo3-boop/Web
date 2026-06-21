"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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
  currentTier: "free" | "plus" | "premium";
  tierExpiresAt: string | null;
  role: "user" | "admin";
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
    // Lắng nghe sự kiện đăng nhập/đăng xuất từ Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Lấy dữ liệu mở rộng từ Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        } else {
          // Nếu user mới tinh (VD: đăng nhập bằng Google lần đầu), tạo Document mới
          const newUserData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "User",
            walletBalance: 0,
            currentTier: "free",
            tierExpiresAt: null,
            role: "user",
            createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUserData);
          setUserData(newUserData);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
