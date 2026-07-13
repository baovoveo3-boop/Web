---
name: sso_desktop_auth
description: Hướng dẫn tích hợp cơ chế cấp Custom Token cho App Desktop thông qua Localhost Callback sau khi đăng nhập Web thành công.
---

# Cơ chế Web-to-App SSO (Desktop Authentication)

Hệ sinh thái B.T AI Labs yêu cầu một trải nghiệm đăng nhập liền mạch: Khách hàng đăng nhập bằng Google trên Website, sau đó Website bắn một token về Localhost để App Desktop tự động mở khóa.

Nếu bạn là AI phụ trách luồng Web (Next.js), bạn **PHẢI** thực hiện cơ chế này:

## Quy trình nghiệp vụ:

1. **Bắt tham số URL:**
   Trang đăng nhập (`/login`) cần kiểm tra URL query params: `?desktop_auth=true&port=54321`.
   Nếu có tham số này, hãy lưu trạng thái vào state hoặc sessionStorage.

2. **Đăng nhập Google:**
   Thực hiện đăng nhập Google bằng `signInWithPopup` hoặc `signInWithRedirect` của Firebase Client SDK như bình thường.

3. **Sinh Custom Token (Phía Server):**
   App Desktop (Python `pyrebase`) bắt buộc phải dùng **Custom Token** để đăng nhập, không dùng được ID Token thông thường.
   Do đó, bạn phải tạo API route tại `app/api/desktop-auth/route.ts`:
   - API này nhận `uid` của user (hoặc ID Token để bảo mật).
   - Dùng `firebase-admin` trên Server: `const customToken = await admin.auth().createCustomToken(uid);`
   - Trả `customToken` về cho Client.

4. **Chuyển hướng về Localhost (Phía Client):**
   Sau khi Client nhận được `customToken` từ API trên, nếu trạng thái `desktop_auth=true` đang bật, **KHÔNG** chuyển hướng user vào Dashboard của Web.
   Thay vào đó, bắt buộc chuyển hướng trình duyệt về cổng Localhost của Desktop App:
   ```javascript
   window.location.href = `http://localhost:54321/callback?token=${customToken}`;
   ```

Tuân thủ nghiêm ngặt quy trình này để đảm bảo App Launcher của hệ sinh thái hoạt động trơn tru!
