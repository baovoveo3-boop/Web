from telegram import BotCommand
from telegram.ext import ApplicationBuilder, CommandHandler
import datetime
import pytz
import sys
import os

# Khắc phục lỗi in tiếng Việt trên console của Windows
sys.stdout.reconfigure(encoding='utf-8')

from config import TELEGRAM_BOT_TOKEN, TIMEZONE
import bot_handlers as handlers
import scheduler_tasks as tasks

async def post_init(application):
    """Thiết lập Bot Commands Menu trên Telegram."""
    commands = [
        BotCommand("start", "Đăng ký nhận thông báo World Cup"),
        BotCommand("lich", "Xem lịch thi đấu hôm nay"),
        BotCommand("lichtong", "Xem toàn bộ lịch thi đấu sắp tới"),
        BotCommand("tyso", "Xem tổng hợp tỉ số các trận đã kết thúc"),
        BotCommand("bxh", "Xem bảng xếp hạng các bảng đấu"),
        BotCommand("huy", "Hủy nhận thông báo tự động")
    ]
    await application.bot.set_my_commands(commands)

def main():
    """Hàm khởi chạy Bot."""
    if not TELEGRAM_BOT_TOKEN:
        print("LỖI: Chưa có TELEGRAM_BOT_TOKEN trong file .env")
        return

    print("Đang khởi động World Cup 2026 Bot (Kiến trúc Webhook)...")
    
    # Khởi tạo Application (tự động bao gồm JobQueue)
    app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).post_init(post_init).build()

    # Đăng ký lệnh cơ bản
    app.add_handler(CommandHandler("start", handlers.start))
    app.add_handler(CommandHandler("bxh", handlers.bang_xep_hang))
    app.add_handler(CommandHandler("lich", handlers.lich_thi_dau))
    app.add_handler(CommandHandler("lichtong", handlers.lichtong))
    app.add_handler(CommandHandler("tyso", handlers.tyso))
    app.add_handler(CommandHandler("huy", handlers.stop))
    
    # Tạm dừng vòng lặp thông báo vì giải đấu đã kết thúc
    # job_queue = app.job_queue
    # job_queue.run_repeating(tasks.poll_events, interval=300, first=10)
    
    # Kích hoạt tính năng Dummy Server để đánh lừa Render và UptimeRobot
    # Render yêu cầu Web Service phải lắng nghe trên 1 Cổng (PORT) và trả về 200 OK.
    # Ta sẽ tạo một máy chủ web siêu nhỏ chỉ để trả lời UptimeRobot.
    port = int(os.environ.get("PORT", 10000))
    render_url = os.environ.get("RENDER_EXTERNAL_URL")
    
    if render_url:
        print(f"Đã phát hiện Server Render. Đang tạo Dummy HTTP Server tại cổng {port} để giữ thức...")
        import threading
        from http.server import BaseHTTPRequestHandler, HTTPServer
        
        class KeepAliveHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(b"Bot World Cup 2026 dang hoat dong hoan hao!")
                
            # Render Health Check đôi khi dùng HEAD request
            def do_HEAD(self):
                self.send_response(200)
                self.end_headers()
                
        def run_dummy_server():
            server = HTTPServer(('0.0.0.0', port), KeepAliveHandler)
            server.serve_forever()
            
        # Chạy Dummy Server trên một luồng (thread) chạy ngầm
        threading.Thread(target=run_dummy_server, daemon=True).start()
        
        print("Khởi chạy Bot Telegram ở chế độ Polling (Hoạt động song song với Dummy Server)...")
        app.run_polling(drop_pending_updates=True)
    else:
        print("Khởi chạy ở chế độ Polling (Dành cho máy tính cá nhân)...")
        app.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    main()
