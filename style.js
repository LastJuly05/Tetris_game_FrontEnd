/**
 * Tetris - Game Xếp Gạch
 * Hệ thống Level 1 & Tiến trình cấp độ
 * Sử dụng HTML5 Canvas & Web Audio API
 */

(function () {

    // ============================================================
    // Lấy phần tử Canvas & DOM
    // ============================================================

    const canvasBang    = document.getElementById('board');
    const ngCanhBang    = canvasBang.getContext('2d');
    const canvasKhoi    = document.getElementById('next');
    const ngCanhKhoi    = canvasKhoi.getContext('2d');

    const phanTuDiem        = document.getElementById('score');
    const phanTuHang        = document.getElementById('lines');
    const phanTuCap         = document.getElementById('level');
    const nutBatDau         = document.getElementById('start');
    const nutAmThanh        = document.getElementById('btn-sound');
    const thongBaoBang      = document.getElementById('board-message');
    const phanTuDiemHienTai = document.getElementById('curr-pts');
    const phanTuMucTieu     = document.getElementById('target-pts');
    const thanhTienTrinh    = document.getElementById('progress-bar-fill');

    const modalChienThang   = document.getElementById('victory-modal');
    const modalDiemCT       = document.getElementById('modal-score');
    const modalHangCT       = document.getElementById('modal-lines');
    const nutTiepTuc        = document.getElementById('btn-continue');
    const nutLevelTiep      = document.getElementById('btn-next-level');

    const modalGameOver     = document.getElementById('gameover-modal');
    const goDiem            = document.getElementById('go-score');
    const goHang            = document.getElementById('go-lines');
    const nutChoiLai        = document.getElementById('btn-restart');

    // ============================================================
    // Hằng số cố định
    // ============================================================

    const SO_COT          = 10;
    const SO_HANG         = 20;
    const KICH_THUOC_O    = 30;    // 300px / 10 cột = 30px mỗi ô
    const KICH_THUOC_XEM  = 24;    // kích thước ô trong khung xem trước

    // Bảng màu 7 loại khối (chỉ số 1–7, chỉ số 0 = trống)
    const BANG_MAU = [
        null,
        { chinh: '#00F0FF', sang: '#BCFEFE', toi: '#0099AA' }, // I - Cyan
        { chinh: '#1E88E5', sang: '#90CAF9', toi: '#0D47A1' }, // J - Xanh dương
        { chinh: '#FFA726', sang: '#FFE082', toi: '#E65100' }, // L - Cam
        { chinh: '#FFD54F', sang: '#FFF9C4', toi: '#F57F17' }, // O - Vàng
        { chinh: '#26A69A', sang: '#80CBC4', toi: '#004D40' }, // S - Xanh lục
        { chinh: '#AB47BC', sang: '#CE93D8', toi: '#4A148C' }, // T - Tím
        { chinh: '#FF5252', sang: '#FFCDD2', toi: '#B71C1C' }, // Z - Đỏ
    ];

    // Hình dạng 7 loại khối Tetromino (ma trận 2D)
    const HINH_KHOI = [
        null,
        // I
        [[0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]],
        // J
        [[2,0,0],
            [2,2,2],
            [0,0,0]],
        // L
        [[0,0,3],
            [3,3,3],
            [0,0,0]],
        // O
        [[4,4],
            [4,4]],
        // S
        [[0,5,5],
            [5,5,0],
            [0,0,0]],
        // T
        [[0,6,0],
            [6,6,6],
            [0,0,0]],
        // Z
        [[7,7,0],
            [0,7,7],
            [0,0,0]],
    ];

    // ============================================================
    // Âm thanh — Tổng hợp bằng Web Audio API
    // ============================================================

    let boAm        = null;   // AudioContext
    let batAmThanh  = true;   // trạng thái bật/tắt âm thanh

    /** Khởi tạo AudioContext (cần tương tác người dùng trước) */
    function khoiTaoAm() {
        if (!boAm) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) boAm = new AC();
        }
        if (boAm && boAm.state === 'suspended') boAm.resume();
    }

    /** Phát một âm đơn giản theo tần số & thời lượng */
    function phatAm(tanSo, thoiLuong, loai = 'sine', amLuong = 0.15) {
        if (!batAmThanh || !boAm) return;
        try {
            const dao  = boAm.createOscillator();
            const khuech = boAm.createGain();
            dao.type = loai;
            dao.frequency.setValueAtTime(tanSo, boAm.currentTime);
            khuech.gain.setValueAtTime(amLuong, boAm.currentTime);
            khuech.gain.exponentialRampToValueAtTime(0.0001, boAm.currentTime + thoiLuong);
            dao.connect(khuech);
            khuech.connect(boAm.destination);
            dao.start();
            dao.stop(boAm.currentTime + thoiLuong);
        } catch (e) {}
    }

    /** Âm khi di chuyển khối */
    function amDiChuyen()  { phatAm(180, 0.04, 'triangle', 0.08); }

    /** Âm khi khối rơi xuống / khóa */
    function amRoi()       { phatAm(90,  0.09, 'sine',     0.20); }

    /** Âm khi xoay khối (tần số tăng dần) */
    function amXoay() {
        if (!batAmThanh || !boAm) return;
        try {
            const dao    = boAm.createOscillator();
            const khuech = boAm.createGain();
            dao.type = 'triangle';
            dao.frequency.setValueAtTime(320, boAm.currentTime);
            dao.frequency.exponentialRampToValueAtTime(520, boAm.currentTime + 0.07);
            khuech.gain.setValueAtTime(0.1,  boAm.currentTime);
            khuech.gain.exponentialRampToValueAtTime(0.001, boAm.currentTime + 0.07);
            dao.connect(khuech);
            khuech.connect(boAm.destination);
            dao.start();
            dao.stop(boAm.currentTime + 0.07);
        } catch (e) {}
    }

    /** Âm khi xóa hàng (số hàng xóa càng nhiều → âm càng cao) */
    function amXoaHang(soHang) {
        if (!batAmThanh || !boAm) return;
        const notam = soHang >= 4 ? [440, 554, 659, 880] : [523, 659, 784];
        notam.forEach((f, i) => setTimeout(() => phatAm(f, 0.18, 'triangle', 0.2), i * 70));
    }

    /** Âm chiến thắng — giai điệu ngắn vui */
    function amChienThang() {
        if (!batAmThanh || !boAm) return;
        [{ f: 523.25 }, { f: 659.25 }, { f: 783.99 }, { f: 1046.50 }]
            .forEach((n, i) => setTimeout(() => phatAm(n.f, 0.18, 'triangle', 0.25), i * 130));
    }

    /** Âm game over — giai điệu giảm dần */
    function amGameOver() {
        if (!batAmThanh || !boAm) return;
        [440, 392, 349, 293].forEach((f, i) =>
            setTimeout(() => phatAm(f, 0.25, 'sawtooth', 0.15), i * 150)
        );
    }

    // ============================================================
    // Biến trạng thái game
    // ============================================================

    let luoi, diem, soHang, capDo, mucTieuDiem;
    let level1HoanThanh;
    let khoiHienTai, khoiTiepTheo, tuiKhoi;
    let dangChoi, dangDung, ketThuc;
    let doDem, thoiGianTruoc, idFrame, tocDoRoi;

    /** Tính tốc độ rơi theo cấp độ (ms/bước rơi) */
    function layTocDoRoi(cap) {
        if (cap === 1) return 850;
        if (cap === 2) return 500;
        if (cap === 3) return 350;
        return Math.max(150, 250 - (cap - 4) * 30);
    }

    // ============================================================
    // Tạo lưới & Khởi tạo khối
    // ============================================================

    /** Tạo lưới trống (mảng 2D toàn số 0) */
    function taoLuoi() {
        return Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(0));
    }

    /**
     * Lấy loại khối tiếp theo theo thuật toán 7-Bag:
     * trộn ngẫu nhiên 7 loại rồi lấy từng cái ra
     */
    function layLoaiKhoiTiep() {
        if (tuiKhoi.length === 0) {
            tuiKhoi = [1, 2, 3, 4, 5, 6, 7];
            // Trộn ngẫu nhiên (Fisher-Yates)
            for (let i = tuiKhoi.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tuiKhoi[i], tuiKhoi[j]] = [tuiKhoi[j], tuiKhoi[i]];
            }
        }
        return tuiKhoi.pop();
    }

    /** Tạo đối tượng khối từ loại khối */
    function taoKhoi(loai) {
        const hinh = HINH_KHOI[loai].map(hang => [...hang]);
        return {
            loai,
            hinh,
            x: Math.floor((SO_COT - hinh[0].length) / 2),
            y: 0
        };
    }

    // ============================================================
    // Kiểm tra va chạm
    // ============================================================

    /**
     * Trả về true nếu khối ở vị trí (piece.x + lệchX, piece.y + lệchY)
     * bị chạm tường hoặc chạm ô đã bị chiếm.
     */
    function vaChạm(khoi, lệchX = 0, lệchY = 0, hinhKiemTra = null) {
        const hinh = hinhKiemTra || khoi.hinh;
        for (let h = 0; h < hinh.length; h++) {
            for (let c = 0; c < hinh[h].length; c++) {
                if (!hinh[h][c]) continue;
                const nx = khoi.x + c + lệchX;
                const ny = khoi.y + h + lệchY;
                // Chạm tường trái/phải hoặc đáy
                if (nx < 0 || nx >= SO_COT || ny >= SO_HANG) return true;
                // Chạm ô đã bị chiếm (bỏ qua các ô phía trên bảng)
                if (ny >= 0 && luoi[ny][nx] !== 0) return true;
            }
        }
        return false;
    }

    // ============================================================
    // Điều khiển khối
    // ============================================================

    /** Di chuyển khối sang trái */
    function diTrai() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, -1, 0)) {
            khoiHienTai.x--;
            amDiChuyen();
            ve();
        }
    }

    /** Di chuyển khối sang phải */
    function diPhai() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, 1, 0)) {
            khoiHienTai.x++;
            amDiChuyen();
            ve();
        }
    }

    /** Xoay khối (kèm wall kick để tránh kẹt tường) */
    function xoayKhoi() {
        if (!coTheDieuKhien()) return;
        if (khoiHienTai.loai === 4) return; // Khối O hình vuông — không cần xoay

        const hinhXoay = xoayMaTran(khoiHienTai.hinh);
        // Các lệch thử (wall kick): thẳng, trái, phải, trái 2, phải 2, lên
        const cachKick = [[0,0], [-1,0], [1,0], [-2,0], [2,0], [0,-1]];

        for (const [lx, ly] of cachKick) {
            if (!vaChạm(khoiHienTai, lx, ly, hinhXoay)) {
                khoiHienTai.hinh  = hinhXoay;
                khoiHienTai.x    += lx;
                khoiHienTai.y    += ly;
                amXoay();
                ve();
                return;
            }
        }
    }

    /** Xoay ma trận 90° theo chiều kim đồng hồ */
    function xoayMaTran(m) {
        const N      = m.length;
        const ketQua = Array.from({ length: N }, () => Array(N).fill(0));
        for (let h = 0; h < N; h++)
            for (let c = 0; c < N; c++)
                ketQua[c][N - 1 - h] = m[h][c];
        return ketQua;
    }

    /** Rơi tự động (gọi bởi vòng lặp game) */
    function roi() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, 0, 1)) {
            khoiHienTai.y++;
            doDem = 0;
            ve();
        } else {
            khoaKhoi();
        }
    }

    /** Rơi nhanh (Soft Drop — nhấn ↓) */
    function roiNhanh() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, 0, 1)) {
            khoiHienTai.y++;
            congDiem(1); // 1 điểm/ô khi soft drop
            amDiChuyen();
            doDem = 0;
            ve();
        } else {
            khoaKhoi();
        }
    }

    /** Thả rơi ngay (Hard Drop — nhấn Space) */
    function roiNgay() {
        if (!coTheDieuKhien()) return;
        let soO = 0;
        while (!vaChạm(khoiHienTai, 0, 1)) {
            khoiHienTai.y++;
            soO++;
        }
        congDiem(soO * 2); // 2 điểm/ô khi hard drop
        amRoi();
        khoaKhoi();
    }

    /** Kiểm tra có thể điều khiển khối không */
    function coTheDieuKhien() {
        return dangChoi && !dangDung && !ketThuc && khoiHienTai;
    }

    /** Lấy vị trí Y của khối bóng (ghost piece — hiện vị trí sẽ rơi) */
    function layYKhoiBong() {
        if (!khoiHienTai) return 0;
        let gy = khoiHienTai.y;
        while (!vaChạm(khoiHienTai, 0, gy - khoiHienTai.y + 1)) gy++;
        return gy;
    }

    // ============================================================
    // Khóa khối vào lưới & Xóa hàng
    // ============================================================

    /** Khóa khối hiện tại vào lưới, sau đó xóa hàng & spawn khối mới */
    function khoaKhoi() {
        amRoi();
        for (let h = 0; h < khoiHienTai.hinh.length; h++) {
            for (let c = 0; c < khoiHienTai.hinh[h].length; c++) {
                if (!khoiHienTai.hinh[h][c]) continue;
                const ly = khoiHienTai.y + h;
                const lx = khoiHienTai.x + c;
                // Khóa phía trên bảng → game over
                if (ly < 0) { kichHoatGameOver(); return; }
                luoi[ly][lx] = khoiHienTai.hinh[h][c];
            }
        }
        xoaHangDay();
        taoKhoiMoi();
    }

    /** Quét & xóa các hàng đã đầy, tính điểm tương ứng */
    function xoaHangDay() {
        let soHangXoa = 0;
        for (let h = SO_HANG - 1; h >= 0; h--) {
            if (luoi[h].every(o => o !== 0)) {
                luoi.splice(h, 1);                    // Xóa hàng
                luoi.unshift(Array(SO_COT).fill(0));  // Thêm hàng trống lên đầu
                soHangXoa++;
                h++; // Kiểm tra lại cùng vị trí sau khi dịch
            }
        }
        if (soHangXoa === 0) return;

        soHang += soHangXoa;

        // Bảng điểm chuẩn Tetris: 1=100, 2=300, 3=500, 4=800 (nhân cấp độ)
        const bangDiem = [0, 100, 300, 500, 800];
        congDiem((bangDiem[soHangXoa] || soHangXoa * 200) * capDo);
        amXoaHang(soHangXoa);
        capNhatGiaoDien();
    }

    // ============================================================
    // Điểm số & Cập nhật giao diện
    // ============================================================

    /** Cộng điểm & kiểm tra điều kiện chiến thắng Level 1 */
    function congDiem(soLuong) {
        diem += soLuong;
        capNhatGiaoDien();
        // Điều kiện chiến thắng Level 1: đạt 1000 điểm
        if (capDo === 1 && diem >= 1000 && !level1HoanThanh) {
            xuLyChienThangLevel1();
        }
    }

    /** Cập nhật tất cả số liệu hiển thị trên màn hình */
    function capNhatGiaoDien() {
        phanTuDiem.textContent        = diem.toLocaleString();
        phanTuHang.textContent        = soHang;
        phanTuCap.textContent         = capDo;
        phanTuDiemHienTai.textContent = diem.toLocaleString();
        phanTuMucTieu.textContent     = mucTieuDiem.toLocaleString();
        const phanTram                = Math.min(100, Math.floor(diem / mucTieuDiem * 100));
        thanhTienTrinh.style.width    = phanTram + '%';
    }

    // ============================================================
    // Chiến thắng Level 1 & Game Over
    // ============================================================

    /** Xử lý khi đạt mốc 1000 điểm — hiện modal chiến thắng */
    function xuLyChienThangLevel1() {
        level1HoanThanh = true;
        dangDung        = true;
        cancelAnimationFrame(idFrame);

        amChienThang();
        batConfetti();

        modalDiemCT.textContent = diem.toLocaleString();
        modalHangCT.textContent = soHang;
        modalChienThang.classList.remove('hidden');
    }

    /** Người dùng chọn "Tiếp tục" — đóng modal, chơi tiếp cùng level */
    function chonTiepTuc() {
        modalChienThang.classList.add('hidden');
        xoaConfetti();
        dangDung        = false;
        thoiGianTruoc   = performance.now();
        idFrame         = requestAnimationFrame(vongLapGame);
    }

    /** Người dùng chọn "Chơi level tiếp theo" — chuyển sang Level 2 */
    function chonLevelTiep() {
        modalChienThang.classList.add('hidden');
        xoaConfetti();

        capDo       = 2;
        mucTieuDiem = 2500; // Mục tiêu điểm cho Level 2
        tocDoRoi    = layTocDoRoi(capDo);

        const nhan = document.querySelector('.progress-label span:first-child');
        if (nhan) nhan.textContent = 'Tiến trình Level ' + capDo;

        amChienThang();
        capNhatGiaoDien();

        dangDung      = false;
        thoiGianTruoc = performance.now();
        idFrame       = requestAnimationFrame(vongLapGame);
    }

    /** Kích hoạt trạng thái Game Over */
    function kichHoatGameOver() {
        ketThuc   = true;
        dangChoi  = false;
        cancelAnimationFrame(idFrame);
        amGameOver();

        goDiem.textContent = diem.toLocaleString();
        goHang.textContent = soHang;
        modalGameOver.classList.remove('hidden');

        nutBatDau.textContent = '▶ Bắt đầu lại';
    }

    // ============================================================
    // Tạo khối mới (Spawn)
    // ============================================================

    /** Lấy khối tiếp theo từ túi, kiểm tra game over nếu bị chặn */
    function taoKhoiMoi() {
        if (!khoiTiepTheo) khoiTiepTheo = taoKhoi(layLoaiKhoiTiep());
        khoiHienTai  = khoiTiepTheo;
        khoiTiepTheo = taoKhoi(layLoaiKhoiTiep());

        // Nếu vị trí spawn bị chặn → game over
        if (vaChạm(khoiHienTai)) {
            kichHoatGameOver();
            return;
        }
        veKhoiXemTruoc();
    }

    // ============================================================
    // Vẽ (Rendering)
    // ============================================================

    /**
     * Vẽ một ô khối lên canvas
     * @param {CanvasRenderingContext2D} ctx - context canvas
     * @param {number} x - cột
     * @param {number} y - hàng
     * @param {number} mauId - chỉ số màu (1-7)
     * @param {number} kichThuoc - kích thước ô (px)
     * @param {boolean} laBong - true = vẽ bóng mờ (ghost piece)
     */
    function veO(ctx, x, y, mauId, kichThuoc, laBong = false) {
        const mau = BANG_MAU[mauId];
        if (!mau) return;

        const px = x * kichThuoc;
        const py = y * kichThuoc;

        if (laBong) {
            // Vẽ khối bóng (ghost): chỉ viền mờ
            ctx.save();
            ctx.strokeStyle = mau.sang;
            ctx.lineWidth   = 1.5;
            ctx.strokeRect(px + 1.5, py + 1.5, kichThuoc - 3, kichThuoc - 3);
            ctx.fillStyle   = 'rgba(188,254,254,0.06)';
            ctx.fillRect(px + 2, py + 2, kichThuoc - 4, kichThuoc - 4);
            ctx.restore();
            return;
        }

        ctx.save();

        // 1. Nền khối màu chính
        ctx.fillStyle = mau.chinh;
        ctx.fillRect(px + 1, py + 1, kichThuoc - 2, kichThuoc - 2);

        // 2. Highlight góc trên-trái (hiệu ứng 3D giả)
        ctx.fillStyle = mau.sang;
        ctx.beginPath();
        ctx.moveTo(px + 1,           py + 1);
        ctx.lineTo(px + kichThuoc-1, py + 1);
        ctx.lineTo(px + kichThuoc-4, py + 4);
        ctx.lineTo(px + 4,           py + 4);
        ctx.lineTo(px + 4,           py + kichThuoc-4);
        ctx.lineTo(px + 1,           py + kichThuoc-1);
        ctx.closePath();
        ctx.fill();

        // 3. Bóng tối góc dưới-phải
        ctx.fillStyle = mau.toi;
        ctx.beginPath();
        ctx.moveTo(px + kichThuoc-1, py + 1);
        ctx.lineTo(px + kichThuoc-1, py + kichThuoc-1);
        ctx.lineTo(px + 1,           py + kichThuoc-1);
        ctx.lineTo(px + 4,           py + kichThuoc-4);
        ctx.lineTo(px + kichThuoc-4, py + kichThuoc-4);
        ctx.lineTo(px + kichThuoc-4, py + 4);
        ctx.closePath();
        ctx.fill();

        // 4. Ánh sáng trung tâm nhỏ
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(px + 6, py + 6, kichThuoc - 12, kichThuoc - 12);

        ctx.restore();
    }

    /** Vẽ lưới ô mờ làm nền bảng chơi */
    function veLuoiNen() {
        ngCanhBang.strokeStyle = 'rgba(12,87,118,0.3)';
        ngCanhBang.lineWidth   = 0.5;
        for (let c = 0; c <= SO_COT; c++) {
            ngCanhBang.beginPath();
            ngCanhBang.moveTo(c * KICH_THUOC_O, 0);
            ngCanhBang.lineTo(c * KICH_THUOC_O, SO_HANG * KICH_THUOC_O);
            ngCanhBang.stroke();
        }
        for (let h = 0; h <= SO_HANG; h++) {
            ngCanhBang.beginPath();
            ngCanhBang.moveTo(0,                  h * KICH_THUOC_O);
            ngCanhBang.lineTo(SO_COT * KICH_THUOC_O, h * KICH_THUOC_O);
            ngCanhBang.stroke();
        }
    }

    /** Vẽ toàn bộ bảng chơi: lưới nền + các ô đã khóa + bóng + khối hiện tại */
    function ve() {
        ngCanhBang.clearRect(0, 0, canvasBang.width, canvasBang.height);
        veLuoiNen();

        // Vẽ các ô đã được khóa vào lưới
        for (let h = 0; h < SO_HANG; h++)
            for (let c = 0; c < SO_COT; c++)
                if (luoi[h][c]) veO(ngCanhBang, c, h, luoi[h][c], KICH_THUOC_O);

        // Vẽ khối bóng (ghost) & khối đang rơi
        if (khoiHienTai && dangChoi && !ketThuc) {
            const yBong = layYKhoiBong();
            const hinh  = khoiHienTai.hinh;

            // Vẽ bóng nếu không trùng vị trí khối thật
            if (yBong !== khoiHienTai.y) {
                for (let h = 0; h < hinh.length; h++)
                    for (let c = 0; c < hinh[h].length; c++)
                        if (hinh[h][c])
                            veO(ngCanhBang, khoiHienTai.x + c, yBong + h, hinh[h][c], KICH_THUOC_O, true);
            }

            // Vẽ khối thật
            for (let h = 0; h < hinh.length; h++)
                for (let c = 0; c < hinh[h].length; c++)
                    if (hinh[h][c])
                        veO(ngCanhBang, khoiHienTai.x + c, khoiHienTai.y + h, hinh[h][c], KICH_THUOC_O);
        }
    }

    /** Vẽ khối xem trước (preview) trong ô nhỏ bên phải */
    function veKhoiXemTruoc() {
        ngCanhKhoi.clearRect(0, 0, canvasKhoi.width, canvasKhoi.height);
        if (!khoiTiepTheo) return;

        const hinh   = khoiTiepTheo.hinh;
        const rong   = hinh[0].length * KICH_THUOC_XEM;
        const cao    = hinh.length    * KICH_THUOC_XEM;
        const batDauX = Math.floor((canvasKhoi.width  - rong) / (2 * KICH_THUOC_XEM));
        const batDauY = Math.floor((canvasKhoi.height - cao)  / (2 * KICH_THUOC_XEM));

        for (let h = 0; h < hinh.length; h++)
            for (let c = 0; c < hinh[h].length; c++)
                if (hinh[h][c])
                    veO(ngCanhKhoi, batDauX + c, batDauY + h, hinh[h][c], KICH_THUOC_XEM);
    }

    // ============================================================
    // Vòng lặp game chính
    // ============================================================

    function vongLapGame(thoiGian = 0) {
        if (!dangChoi || dangDung || ketThuc) return;

        const dt        = thoiGian - thoiGianTruoc;
        thoiGianTruoc   = thoiGian;

        doDem += dt;
        if (doDem > tocDoRoi) {
            roi();
            doDem = 0;
        }

        ve();
        idFrame = requestAnimationFrame(vongLapGame);
    }

    // ============================================================
    // Bắt đầu / Tạm dừng / Đặt lại game
    // ============================================================

    /** Đặt lại toàn bộ và bắt đầu ván mới */
    function batDauGame() {
        khoiTaoAm();

        luoi            = taoLuoi();
        diem            = 0;
        soHang          = 0;
        capDo           = 1;
        mucTieuDiem     = 1000;
        level1HoanThanh = false;
        tocDoRoi        = layTocDoRoi(1);
        tuiKhoi         = [];
        khoiTiepTheo    = null;
        khoiHienTai     = null;
        dangChoi        = true;
        dangDung        = false;
        ketThuc         = false;
        doDem           = 0;

        modalChienThang.classList.add('hidden');
        modalGameOver.classList.add('hidden');
        thongBaoBang.classList.remove('visible');
        xoaConfetti();

        const nhan = document.querySelector('.progress-label span:first-child');
        if (nhan) nhan.textContent = 'Tiến trình Level 1';

        capNhatGiaoDien();
        taoKhoiMoi();
        taoKhoiMoi(); // Gọi 2 lần: lần 1 → khoiHienTai, lần 2 → khoiTiepTheo

        nutBatDau.textContent = '⏸ Tạm dừng';
        thoiGianTruoc = performance.now();
        cancelAnimationFrame(idFrame);
        idFrame = requestAnimationFrame(vongLapGame);
    }

    /** Chuyển đổi trạng thái tạm dừng / tiếp tục */
    function togDung() {
        if (!dangChoi || ketThuc) return;
        dangDung = !dangDung;
        if (dangDung) {
            thongBaoBang.classList.add('visible');
            nutBatDau.textContent = '▶ Tiếp tục';
            cancelAnimationFrame(idFrame);
        } else {
            thongBaoBang.classList.remove('visible');
            nutBatDau.textContent = '⏸ Tạm dừng';
            thoiGianTruoc = performance.now();
            idFrame       = requestAnimationFrame(vongLapGame);
        }
    }

    // ============================================================
    // Hiệu ứng Confetti khi chiến thắng
    // ============================================================

    /** Tạo 60 mảnh confetti rơi ngẫu nhiên */
    function batConfetti() {
        xoaConfetti();
        const mauSac = ['#00F0FF','#BCFEFE','#2D99AE','#F8DAD0','#FFD700','#FF5252','#AB47BC'];
        for (let i = 0; i < 60; i++) {
            const manh = document.createElement('div');
            manh.className               = 'confetti-piece';
            manh.style.left              = Math.random() * 100 + 'vw';
            manh.style.backgroundColor   = mauSac[Math.floor(Math.random() * mauSac.length)];
            manh.style.animationDelay    = Math.random() * 0.8 + 's';
            manh.style.animationDuration = (1.8 + Math.random() * 1.5) + 's';
            document.body.appendChild(manh);
        }
    }

    /** Xóa tất cả mảnh confetti khỏi DOM */
    function xoaConfetti() {
        document.querySelectorAll('.confetti-piece').forEach(el => el.remove());
    }

    // ============================================================
    // Gắn sự kiện (Event Listeners)
    // ============================================================

    // Nút Bắt đầu / Tạm dừng
    nutBatDau.addEventListener('click', () => {
        if (!dangChoi || ketThuc) batDauGame();
        else togDung();
    });

    // Nút bật/tắt âm thanh
    nutAmThanh.addEventListener('click', () => {
        khoiTaoAm();
        batAmThanh           = !batAmThanh;
        nutAmThanh.textContent = batAmThanh ? '🔊' : '🔇';
    });

    // Modal chiến thắng — 2 lựa chọn
    nutTiepTuc.addEventListener('click',   chonTiepTuc);
    nutLevelTiep.addEventListener('click', chonLevelTiep);

    // Modal game over
    nutChoiLai.addEventListener('click', batDauGame);

    // Phím bấm bàn phím
    window.addEventListener('keydown', (e) => {
        khoiTaoAm();

        // Ngăn cuộn trang khi dùng phím mũi tên & Space
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
            e.preventDefault();
        }

        if (e.key === 'p' || e.key === 'P') { togDung(); return; }

        if (e.key === 'm' || e.key === 'M') {
            batAmThanh             = !batAmThanh;
            nutAmThanh.textContent = batAmThanh ? '🔊' : '🔇';
            return;
        }

        if (!dangChoi || dangDung || ketThuc) return;

        switch (e.key) {
            case 'ArrowLeft':  case 'a': case 'A': diTrai();    break;
            case 'ArrowRight': case 'd': case 'D': diPhai();    break;
            case 'ArrowUp':    case 'w': case 'W': xoayKhoi();  break;
            case 'ArrowDown':  case 's': case 'S': roiNhanh();  break;
            case ' ':                               roiNgay();   break;
        }
    });

    // Điều khiển cảm ứng (mobile / tablet)
    let camX = 0, camY = 0;

    canvasBang.addEventListener('touchstart', (e) => {
        khoiTaoAm();
        camX = e.touches[0].clientX;
        camY = e.touches[0].clientY;
    }, { passive: true });

    canvasBang.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - camX;
        const dy = e.changedTouches[0].clientY - camY;

        if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
            xoayKhoi();                          // Chạm nhẹ → xoay
        } else if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 25)  diPhai();              // Vuốt phải
            if (dx < -25) diTrai();              // Vuốt trái
        } else {
            if (dy > 30) roiNhanh();             // Vuốt xuống → rơi nhanh
        }
    }, { passive: true });

    // Vẽ màn hình trống lúc mới tải trang
    ve();
    veKhoiXemTruoc();
    capNhatGiaoDien();

})();
