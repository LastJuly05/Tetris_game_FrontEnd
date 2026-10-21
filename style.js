/**
 * Tetris - Game Xếp Gạch
 *   - Màn 1: Cổ Điển (Đạt 1000 điểm)
 *   - Màn 2: Đảo Phím Bấm (Trái ⇄ Phải, Đạt 2000 điểm - Tích hợp khung riêng)
 *   - Màn 3: Thu Thập 10 Loại Icon (Trái tim, Vương miện, Ngôi sao, Tia chớp, Kim cương, Lửa, Bông tuyết, Lá cây, Giọt nước, Dâu tây)
 *   - Giao diện 3 cột gọn gàng, vừa khít 1 khung màn hình KHÔNG SCROLL
 *   - ĐÃ ẨN HOÀN TOÀN ĐƯỜNG ĐI CUỐI CÙNG (GHOST PIECE)
 */

(function () {
    'use strict';

    // ============================================================
    // Danh sách 10 loại Icon chuẩn theo ảnh mẫu
    // ============================================================

    const DANH_SACH_10_ICON = [
        { id: 'heart',      ten: 'Trái tim',    icon: '❤️', mau: '#ff2d78', bg: '#4a0e2e' },
        { id: 'crown',      ten: 'Vương miện',  icon: '👑', mau: '#fbbf24', bg: '#451a03' },
        { id: 'star',       ten: 'Ngôi sao',    icon: '⭐', mau: '#facc15', bg: '#422006' },
        { id: 'lightning',  ten: 'Tia chớp',    icon: '⚡', mau: '#22d3ee', bg: '#083344' },
        { id: 'diamond',    ten: 'Kim cương',   icon: '💎', mau: '#c084fc', bg: '#3b0764' },
        { id: 'fire',       ten: 'Lửa',         icon: '🔥', mau: '#fb923c', bg: '#431407' },
        { id: 'snowflake',  ten: 'Bông tuyết',  icon: '❄️', mau: '#7dd3fc', bg: '#0c4a6e' },
        { id: 'leaf',       ten: 'Lá cây',      icon: '🍃', mau: '#4ade80', bg: '#052e16' },
        { id: 'water',      ten: 'Giọt nước',   icon: '💧', mau: '#60a5fa', bg: '#172554' },
        { id: 'strawberry', ten: 'Dâu tây',     icon: '🍓', mau: '#fb7185', bg: '#4c0519' }
    ];

    const TEN_KHOI = [
        '',
        'Khối chữ I',
        'Khối chữ J',
        'Khối chữ L',
        'Khối chữ O',
        'Khối chữ S',
        'Khối chữ T',
        'Khối chữ Z'
    ];

    // ============================================================
    // DOM Elements
    // ============================================================

    const canvasBang        = document.getElementById('board');
    const ngCanhBang        = canvasBang.getContext('2d');
    const canvasKhoi        = document.getElementById('next');
    const ngCanhKhoi        = canvasKhoi.getContext('2d');

    const phanTuDiem        = document.getElementById('score');
    const phanTuHang        = document.getElementById('lines');
    const phanTuCap         = document.getElementById('level');
    const phanTuThoiGian    = document.getElementById('game-time');
    const nutBatDau         = document.getElementById('start');
    const nutAmThanh        = document.getElementById('btn-sound');
    const thongBaoBang      = document.getElementById('board-message');
    const moTaKhoiTiep      = document.getElementById('next-desc');
    const toastQua          = document.getElementById('fruit-toast');

    // Cột trái: 2 chế độ hiển thị
    const sectionIconList   = document.getElementById('icon-list-section');
    const iconProgressBadge = document.getElementById('icon-progress-badge');
    const sectionMission    = document.getElementById('mission-section');
    const missionTitle      = document.getElementById('mission-title');
    const missionDesc       = document.getElementById('mission-desc');
    const missionGoalLabel  = document.getElementById('mission-goal-label');
    const missionGoalVal    = document.getElementById('mission-goal-val');
    const leftProgressFill  = document.getElementById('left-progress-fill');
    const boxDaoPhim        = document.getElementById('alert-inverted-box');

    // Menu & Điều hướng màn hình
    const menuChinh         = document.getElementById('main-menu');
    const khungGame         = document.getElementById('game-container');
    const nutVeMenu         = document.getElementById('btn-back-menu');
    const textLevelHienTai  = document.getElementById('current-level-text');

    const cardLvl1          = document.getElementById('card-lvl-1');
    const cardLvl2          = document.getElementById('card-lvl-2');
    const cardLvl3          = document.getElementById('card-lvl-3');

    // Modals
    const modalChienThang   = document.getElementById('victory-modal');
    const modalTieuDe       = document.getElementById('modal-title');
    const modalMoTa         = document.getElementById('modal-desc');
    const modalDiemCT       = document.getElementById('modal-score');
    const modalHangCT       = document.getElementById('modal-lines');
    const nutTiepTuc        = document.getElementById('btn-continue');
    const nutLevelTiep      = document.getElementById('btn-next-level');
    const nutModalMenu      = document.getElementById('btn-modal-menu');

    const modalQuestWin     = document.getElementById('quest-victory-modal');
    const questWinDiem      = document.getElementById('quest-win-score');
    const questWinHang      = document.getElementById('quest-win-lines');
    const questWinThoiGian  = document.getElementById('quest-win-time');
    const nutQuestChoiLai   = document.getElementById('btn-quest-replay');
    const nutQuestMenu      = document.getElementById('btn-quest-menu');

    const modalGameOver     = document.getElementById('gameover-modal');
    const goDiem            = document.getElementById('go-score');
    const goHang            = document.getElementById('go-lines');
    const nutChoiLai        = document.getElementById('btn-restart');
    const nutGameOverMenu   = document.getElementById('btn-gameover-menu');

    // ============================================================
    // Cấu hình Bảng & Khối
    // ============================================================

    const SO_COT          = 10;
    const SO_HANG         = 20;
    const KICH_THUOC_O    = 30;
    const KICH_THUOC_XEM  = 24;

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

    const HINH_KHOI = [
        null,
        [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
        [[2,0,0],   [2,2,2],   [0,0,0]],               // J
        [[0,0,3],   [3,3,3],   [0,0,0]],               // L
        [[4,4],     [4,4]],                            // O
        [[0,5,5],   [5,5,0],   [0,0,0]],               // S
        [[0,6,0],   [6,6,6],   [0,0,0]],               // T
        [[7,7,0],   [0,7,7],   [0,0,0]],               // Z
    ];

    // ============================================================
    // Âm thanh Web Audio API
    // ============================================================

    let boAm        = null;
    let batAmThanh  = true;

    function khoiTaoAm() {
        if (!boAm) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) boAm = new AC();
        }
        if (boAm && boAm.state === 'suspended') boAm.resume();
    }

    function phatAm(tanSo, thoiLuong, loai = 'sine', amLuong = 0.15) {
        if (!batAmThanh || !boAm) return;
        try {
            const dao    = boAm.createOscillator();
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

    function amDiChuyen()  { phatAm(200, 0.04, 'triangle', 0.08); }
    function amRoi()       { phatAm(90,  0.09, 'sine',     0.20); }

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

    function amXoaHang(soHang) {
        if (!batAmThanh || !boAm) return;
        const notam = soHang >= 4 ? [440, 554, 659, 880] : [523, 659, 784];
        notam.forEach((f, i) => setTimeout(() => phatAm(f, 0.18, 'triangle', 0.2), i * 70));
    }

    function amSao() {
        if (!batAmThanh || !boAm) return;
        const chime = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        chime.forEach((f, i) => setTimeout(() => phatAm(f, 0.2, 'triangle', 0.22), i * 70));
    }

    function amChienThang() {
        if (!batAmThanh || !boAm) return;
        [{ f: 523.25 }, { f: 659.25 }, { f: 783.99 }, { f: 1046.50 }, { f: 1318.51 }]
            .forEach((n, i) => setTimeout(() => phatAm(n.f, 0.24, 'triangle', 0.25), i * 110));
    }

    function amGameOver() {
        if (!batAmThanh || !boAm) return;
        [440, 392, 349, 293].forEach((f, i) =>
            setTimeout(() => phatAm(f, 0.25, 'sawtooth', 0.15), i * 140)
        );
    }

    // ============================================================
    // Biến trạng thái trò chơi
    // ============================================================

    let luoi;
    let luoiIcon;
    let diem;
    let soHang;
    let capDo = 1;
    let mucTieuDiem;

    // Bộ đếm 10 icon trong Màn 3: { heart: 2, star: 1, ... }
    let boDemIcon = {};
    let boSuuTapDaCo = new Set();

    let khoiHienTai;
    let khoiTiepTheo;
    let tuiKhoi;
    let dangChoi = false;
    let dangDung = false;
    let ketThuc  = false;
    let doDem, thoiGianTruoc, idFrame, tocDoRoi;

    let giayDaChoi = 0;
    let idIntervalTimer = null;
    let timerTimeoutToast = null;

    function layTocDoRoi(cap) {
        if (cap === 1) return 800;
        if (cap === 2) return 550;
        if (cap === 3) return 500;
        return 350;
    }

    function dinhDangThoiGian(soGiay) {
        const m = Math.floor(soGiay / 60).toString().padStart(2, '0');
        const s = (soGiay % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function capNhatDongHo() {
        if (dangChoi && !dangDung && !ketThuc) {
            giayDaChoi++;
            phanTuThoiGian.textContent = dinhDangThoiGian(giayDaChoi);
        }
    }

    // ============================================================
    // Quản lý Cấp độ (Hiển thị Cột Trái gọn gàng, không banner)
    // ============================================================

    function datCapDo(cap, khoiDongLai = true) {
        capDo = cap;
        boDemIcon = {};
        boSuuTapDaCo.clear();

        [tabLvl1, tabLvl2, tabLvl3].forEach((tab, idx) => {
            if (tab) tab.classList.toggle('active', idx + 1 === cap);
        });

        if (cap === 1) {
            mucTieuDiem = 1000;
            sectionIconList.classList.add('hidden');
            sectionMission.classList.remove('hidden');
            boxDaoPhim.classList.add('hidden');

            missionTitle.textContent     = 'NHIỆM VỤ MÀN 1';
            missionDesc.textContent      = 'Chinh phục 1000 điểm để mở khóa Màn 2: Thử thách Đảo Phím!';
            missionGoalLabel.textContent = 'Mục tiêu điểm';
            capNhatHelpText(false);
        } else if (cap === 2) {
            mucTieuDiem = 2000;
            sectionIconList.classList.add('hidden');
            sectionMission.classList.remove('hidden');
            boxDaoPhim.classList.remove('hidden'); // Cảnh báo nằm gọn trong cột trái

            missionTitle.textContent     = 'THỬ THÁCH MÀN 2';
            missionDesc.textContent      = 'Phím bấm Trái và Phải đã bị đảo ngược! Vượt qua 2000 điểm để mở khóa Màn 3!';
            missionGoalLabel.textContent = 'Mục tiêu điểm';
            capNhatHelpText(true);
        } else if (cap === 3) {
            mucTieuDiem = 10;
            sectionIconList.classList.remove('hidden');
            sectionMission.classList.add('hidden');
            boxDaoPhim.classList.add('hidden');

            capNhatGiaoDien10Icon();
            capNhatHelpText(false);
        }

        tocDoRoi = layTocDoRoi(cap);

        if (khoiDongLai) {
            batDauGame();
        } else {
            capNhatGiaoDien();
        }
    }

    function capNhatHelpText(laDaoPhim) {
        if (laDaoPhim) {
            huongDanPhim.innerHTML = `
                <div class="help-item help-inverted-hint"><span>← (Trái)</span> : Sang PHẢI ➔</div>
                <div class="help-item help-inverted-hint"><span>→ (Phải)</span> : Sang TRÁI ⬅</div>
                <div class="help-item"><span>↑</span> : Xoay khối gạch</div>
                <div class="help-item"><span>↓</span> : Rơi nhanh (Soft drop)</div>
                <div class="help-item"><span>Shift / Space</span> : Thả rơi liền</div>
                <div class="help-item"><span>P</span> : Tạm dừng</div>
            `;
        } else {
            huongDanPhim.innerHTML = `
                <div class="help-item"><span>← →</span> : Sang trái / phải</div>
                <div class="help-item"><span>↑</span> : Xoay khối gạch</div>
                <div class="help-item"><span>↓</span> : Rơi nhanh (Soft drop)</div>
                <div class="help-item"><span>Shift / Space</span> : Thả rơi liền</div>
                <div class="help-item"><span>P</span> : Tạm dừng</div>
                <div class="help-item"><span>M</span> : Bật/Tắt âm thanh</div>
            `;
        }
    }

    /** Cập nhật 10 hàng icon trong Cột Trái (Chuẩn ảnh mẫu 1) */
    function capNhatGiaoDien10Icon() {
        const soLoai = boSuuTapDaCo.size;
        iconProgressBadge.textContent = `${soLoai}/10`;

        DANH_SACH_10_ICON.forEach(item => {
            const rowEl   = document.getElementById(`row-${item.id}`);
            const countEl = document.getElementById(`count-${item.id}`);
            const soLuong = boDemIcon[item.id] || 0;

            if (countEl) countEl.textContent = soLuong;

            if (rowEl) {
                if (soLuong > 0) {
                    rowEl.classList.add('collected');
                } else {
                    rowEl.classList.remove('collected');
                }
            }
        });
    }

    function hienThiToast(noiDung, loai = 'moi') {
        if (!toastQua) return;
        clearTimeout(timerTimeoutToast);

        toastQua.textContent = noiDung;
        toastQua.className   = `fruit-toast ${loai === 'moi' ? '' : 'toast-dup'}`;

        timerTimeoutToast = setTimeout(() => {
            toastQua.classList.add('hidden');
        }, 2200);
    }

    // ============================================================
    // Tạo lưới & Khởi tạo khối
    // ============================================================

    function taoLuoi() {
        return Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(0));
    }

    function taoLuoiIcon() {
        return Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(null));
    }

    function layLoaiKhoiTiep() {
        if (tuiKhoi.length === 0) {
            tuiKhoi = [1, 2, 3, 4, 5, 6, 7];
            for (let i = tuiKhoi.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tuiKhoi[i], tuiKhoi[j]] = [tuiKhoi[j], tuiKhoi[i]];
            }
        }
        return tuiKhoi.pop();
    }

    /**
     * Tạo đối tượng khối:
     * - Ở Màn 3: Tần suất ~42% có icon, 58% không có icon.
     * - Random ngẫu nhiên 1 trong 10 loại icon (có thể ra lại loại đã có).
     */
    function taoKhoi(loai) {
        const hinh = HINH_KHOI[loai].map(hang => [...hang]);
        const N = hinh.length;
        const iconGrid = Array.from({ length: N }, () => Array(N).fill(null));

        if (capDo === 3) {
            const coIcon = Math.random() < 0.42;
            if (coIcon) {
                const oHopLe = [];
                for (let r = 0; r < N; r++) {
                    for (let c = 0; c < N; c++) {
                        if (hinh[r][c] !== 0) oHopLe.push({ r, c });
                    }
                }

                if (oHopLe.length > 0) {
                    const oChon = oHopLe[Math.floor(Math.random() * oHopLe.length)];
                    const item = DANH_SACH_10_ICON[Math.floor(Math.random() * DANH_SACH_10_ICON.length)];
                    iconGrid[oChon.r][oChon.c] = item.icon;
                }
            }
        }

        return {
            loai,
            hinh,
            iconGrid,
            x: Math.floor((SO_COT - hinh[0].length) / 2),
            y: 0
        };
    }

    // ============================================================
    // Kiểm tra va chạm & Điều khiển (Đảo phím ở Level 2)
    // ============================================================

    function vaChạm(khoi, lệchX = 0, lệchY = 0, hinhKiemTra = null) {
        const hinh = hinhKiemTra || khoi.hinh;
        for (let h = 0; h < hinh.length; h++) {
            for (let c = 0; c < hinh[h].length; c++) {
                if (!hinh[h][c]) continue;
                const nx = khoi.x + c + lệchX;
                const ny = khoi.y + h + lệchY;
                if (nx < 0 || nx >= SO_COT || ny >= SO_HANG) return true;
                if (ny >= 0 && luoi[ny][nx] !== 0) return true;
            }
        }
        return false;
    }

    function coTheDieuKhien() {
        return dangChoi && !dangDung && !ketThuc && khoiHienTai;
    }

    function diTraiThucTe() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, -1, 0)) {
            khoiHienTai.x--;
            amDiChuyen();
            ve();
        }
    }

    function diPhaiThucTe() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, 1, 0)) {
            khoiHienTai.x++;
            amDiChuyen();
            ve();
        }
    }

    function diTrai() {
        if (capDo === 2) diPhaiThucTe();
        else diTraiThucTe();
    }

    function diPhai() {
        if (capDo === 2) diTraiThucTe();
        else diPhaiThucTe();
    }

    function xoayMaTran(m, fillValue = 0) {
        const N      = m.length;
        const ketQua = Array.from({ length: N }, () => Array(N).fill(fillValue));
        for (let h = 0; h < N; h++) {
            for (let c = 0; c < N; c++) {
                ketQua[c][N - 1 - h] = m[h][c];
            }
        }
        return ketQua;
    }

    function xoayKhoi() {
        if (!coTheDieuKhien()) return;
        if (khoiHienTai.loai === 4) return;

        const hinhXoay = xoayMaTran(khoiHienTai.hinh, 0);
        const iconXoay = xoayMaTran(khoiHienTai.iconGrid, null);
        const cachKick = [[0,0], [-1,0], [1,0], [-2,0], [2,0], [0,-1]];

        for (const [lx, ly] of cachKick) {
            if (!vaChạm(khoiHienTai, lx, ly, hinhXoay)) {
                khoiHienTai.hinh     = hinhXoay;
                khoiHienTai.iconGrid = iconXoay;
                khoiHienTai.x       += lx;
                khoiHienTai.y       += ly;
                amXoay();
                ve();
                return;
            }
        }
    }

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

    function roiNhanh() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, 0, 1)) {
            khoiHienTai.y++;
            congDiem(1);
            amDiChuyen();
            doDem = 0;
            ve();
        } else {
            khoaKhoi();
        }
    }

    function roiNgay() {
        if (!coTheDieuKhien()) return;
        let soO = 0;
        while (!vaChạm(khoiHienTai, 0, 1)) {
            khoiHienTai.y++;
            soO++;
        }
        congDiem(soO * 2);
        amRoi();
        khoaKhoi();
    }

    // ============================================================
    // Khóa khối, Xóa hàng & Xử lý thu thập 10 Icon
    // ============================================================

    function khoaKhoi() {
        amRoi();
        for (let h = 0; h < khoiHienTai.hinh.length; h++) {
            for (let c = 0; c < khoiHienTai.hinh[h].length; c++) {
                if (!khoiHienTai.hinh[h][c]) continue;
                const ly = khoiHienTai.y + h;
                const lx = khoiHienTai.x + c;
                if (ly < 0) {
                    kichHoatGameOver();
                    return;
                }
                luoi[ly][lx] = khoiHienTai.hinh[h][c];
                if (khoiHienTai.iconGrid && khoiHienTai.iconGrid[h][c]) {
                    luoiIcon[ly][lx] = khoiHienTai.iconGrid[h][c];
                }
            }
        }
        xoaHangDay();
        taoKhoiMoi();
    }

    function xoaHangDay() {
        let soHangXoa = 0;
        const iconThuThapTrongLuot = [];

        for (let h = SO_HANG - 1; h >= 0; h--) {
            if (luoi[h].every(o => o !== 0)) {
                for (let c = 0; c < SO_COT; c++) {
                    if (luoiIcon[h][c]) {
                        iconThuThapTrongLuot.push(luoiIcon[h][c]);
                    }
                }

                luoi.splice(h, 1);
                luoi.unshift(Array(SO_COT).fill(0));
                luoiIcon.splice(h, 1);
                luoiIcon.unshift(Array(SO_COT).fill(null));

                soHangXoa++;
                h++;
            }
        }

        if (soHangXoa === 0) return;

        soHang += soHangXoa;
        const bangDiem = [0, 100, 300, 500, 800];
        congDiem((bangDiem[soHangXoa] || soHangXoa * 200) * capDo);
        amXoaHang(soHangXoa);

        // Xử lý thu thập icon ở Màn 3
        if (capDo === 3 && iconThuThapTrongLuot.length > 0) {
            xuLyThuThap10Icon(iconThuThapTrongLuot);
        }

        capNhatGiaoDien();
    }

    function xuLyThuThap10Icon(icons) {
        for (const icon of icons) {
            const item = DANH_SACH_10_ICON.find(q => q.icon === icon);
            if (!item) continue;

            const daCoTruoc = boSuuTapDaCo.has(item.id);
            boDemIcon[item.id] = (boDemIcon[item.id] || 0) + 1;

            if (!daCoTruoc) {
                boSuuTapDaCo.add(item.id);
                amSao();
                capNhatGiaoDien10Icon();
                hienThiToast(`🎉 Mở khóa mới: ${item.icon} ${item.ten}! (${boSuuTapDaCo.size}/10)`, 'moi');

                if (boSuuTapDaCo.size >= 10) {
                    setTimeout(() => {
                        xuLyChienThangLevel3();
                    }, 350);
                    break;
                }
            } else {
                congDiem(200);
                capNhatGiaoDien10Icon();
                hienThiToast(`Thu hoạch ${item.icon} ${item.ten} (+200đ)`, 'trung');
            }
        }
    }

    // ============================================================
    // Điểm số & Giao diện
    // ============================================================

    function congDiem(soLuong) {
        diem += soLuong;
        capNhatGiaoDien();

        if (capDo === 1 && diem >= 1000) {
            xuLyChienThangLevel(1);
        } else if (capDo === 2 && diem >= 2000) {
            xuLyChienThangLevel(2);
        }
    }

    function capNhatGiaoDien() {
        phanTuDiem.textContent = diem.toLocaleString();
        phanTuHang.textContent = soHang;
        phanTuCap.textContent  = capDo;

        if (capDo === 1 || capDo === 2) {
            missionGoalVal.textContent = `${diem.toLocaleString()} / ${mucTieuDiem.toLocaleString()}`;
            const phanTram = Math.min(100, Math.floor((diem / mucTieuDiem) * 100));
            leftProgressFill.style.width = phanTram + '%';
        }
    }

    // ============================================================
    // Chiến thắng & Game Over
    // ============================================================

    function xuLyChienThangLevel(levelVuaQua) {
        dangDung = true;
        cancelAnimationFrame(idFrame);
        amChienThang();
        batConfetti();

        modalDiemCT.textContent = diem.toLocaleString();
        modalHangCT.textContent = soHang;

        if (levelVuaQua === 1) {
            modalTieuDe.textContent = 'Chúc mừng bạn đã chinh phục Level 1!';
            modalMoTa.innerHTML = 'Bạn đã đạt mốc 1000 điểm của Level 1!<br>Sẵn sàng bước vào <strong>Level 2: Thử thách Đảo Phím</strong> chưa?';
            nutLevelTiep.textContent = 'Chơi Level 2: Đảo Phím ➔';
        } else if (levelVuaQua === 2) {
            modalTieuDe.textContent = 'Tuyệt vời! Bạn đã vượt qua Level 2!';
            modalMoTa.innerHTML = 'Bạn đã làm chủ cơ chế Đảo Phím với 2000 điểm!<br>Bước tiếp theo: <strong>Màn 3 - Thu Thập 10 Loại Icon</strong>!';
            nutLevelTiep.textContent = 'Chơi Màn 3: Thu Thập Icon 🍓';
        }

        modalChienThang.classList.remove('hidden');
    }

    function xuLyChienThangLevel3() {
        dangDung = true;
        cancelAnimationFrame(idFrame);
        amChienThang();
        batConfetti();

        questWinDiem.textContent     = diem.toLocaleString();
        questWinHang.textContent     = soHang;
        questWinThoiGian.textContent = dinhDangThoiGian(giayDaChoi);
        modalQuestWin.classList.remove('hidden');
    }

    function chonTiepTuc() {
        modalChienThang.classList.add('hidden');
        xoaConfetti();
        dangDung      = false;
        thoiGianTruoc = performance.now();
        idFrame       = requestAnimationFrame(vongLapGame);
    }

    function chonLevelTiep() {
        modalChienThang.classList.add('hidden');
        xoaConfetti();

        if (capDo === 1) {
            datCapDo(2, true);
        } else if (capDo === 2) {
            datCapDo(3, true);
        }
    }

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
    // Tạo Khối Mới & Preview
    // ============================================================

    function taoKhoiMoi() {
        if (!khoiTiepTheo) khoiTiepTheo = taoKhoi(layLoaiKhoiTiep());
        khoiHienTai  = khoiTiepTheo;
        khoiTiepTheo = taoKhoi(layLoaiKhoiTiep());

        if (moTaKhoiTiep) {
            let ten = TEN_KHOI[khoiTiepTheo.loai] || 'Khối Tetris';
            let iconTrongKhoi = null;
            if (khoiTiepTheo.iconGrid) {
                for (let r = 0; r < khoiTiepTheo.iconGrid.length; r++) {
                    for (let c = 0; c < khoiTiepTheo.iconGrid[r].length; c++) {
                        if (khoiTiepTheo.iconGrid[r][c]) {
                            iconTrongKhoi = khoiTiepTheo.iconGrid[r][c];
                            break;
                        }
                    }
                    if (iconTrongKhoi) break;
                }
            }
            if (iconTrongKhoi) {
                const item = DANH_SACH_10_ICON.find(q => q.icon === iconTrongKhoi);
                moTaKhoiTiep.textContent = `${ten} (${iconTrongKhoi} ${item ? item.ten : ''})`;
            } else {
                moTaKhoiTiep.textContent = ten;
            }
        }

        if (vaChạm(khoiHienTai)) {
            kichHoatGameOver();
            return;
        }

        veKhoiXemTruoc();
    }

    // ============================================================
    // Vẽ (Rendering) — ĐÃ ẨN HOÀN TOÀN ĐƯỜNG ĐI CUỐI CÙNG (GHOST PIECE)
    // ============================================================

    /**
     * Vẽ Huy Hiệu Bo Tròn (Badge) cho từng loại Icon
     * Chuẩn theo ảnh mẫu 1 của người dùng
     */
    function veHuyHieuIcon(ctx, px, py, kichThuoc, icon) {
        const item = DANH_SACH_10_ICON.find(q => q.icon === icon) || { mau: '#ff2d78', bg: '#2b0938' };
        const margin = Math.max(2, Math.round(kichThuoc * 0.1));
        const bx = px + margin;
        const by = py + margin;
        const bw = kichThuoc - margin * 2;
        const bh = kichThuoc - margin * 2;
        const r  = Math.max(3, Math.round(kichThuoc * 0.18));

        ctx.save();

        // 1. Bo tròn góc
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(bx, by, bw, bh, r);
        } else {
            ctx.moveTo(bx + r, by);
            ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
            ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
            ctx.arcTo(bx, by + bh, bx, by, r);
            ctx.arcTo(bx, by, bx + bw, by, r);
        }
        ctx.closePath();

        // 2. Nền huy hiệu tương phản
        ctx.fillStyle = item.bg;
        ctx.fill();

        // 3. Viền huy hiệu màu dạ quang theo icon
        ctx.lineWidth   = Math.max(1.8, Math.round(kichThuoc * 0.08));
        ctx.strokeStyle = item.mau;
        ctx.shadowColor = item.mau;
        ctx.shadowBlur  = 5;
        ctx.stroke();

        // 4. Vẽ icon ở giữa
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur  = 3;
        const fontSize  = Math.round(bw * 0.68);
        ctx.font        = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, bx + bw / 2, by + bh / 2 + 1);

        ctx.restore();
    }

    /** Vẽ một ô khối lên canvas (Không còn bóng mờ) */
    function veO(ctx, x, y, mauId, kichThuoc, icon = null) {
        const mau = BANG_MAU[mauId];
        if (!mau) return;

        const px = x * kichThuoc;
        const py = y * kichThuoc;

        ctx.save();

        // 1. Thân khối màu chính
        ctx.fillStyle = mau.chinh;
        ctx.fillRect(px + 1, py + 1, kichThuoc - 2, kichThuoc - 2);

        // 2. Viền sáng góc trên-trái (3D Bevel)
        ctx.fillStyle = mau.sang;
        ctx.beginPath();
        ctx.moveTo(px + 1,            py + 1);
        ctx.lineTo(px + kichThuoc - 1, py + 1);
        ctx.lineTo(px + kichThuoc - 4, py + 4);
        ctx.lineTo(px + 4,            py + 4);
        ctx.lineTo(px + 4,            py + kichThuoc - 4);
        ctx.lineTo(px + 1,            py + kichThuoc - 1);
        ctx.closePath();
        ctx.fill();

        // 3. Góc tối dưới-phải
        ctx.fillStyle = mau.toi;
        ctx.beginPath();
        ctx.moveTo(px + kichThuoc - 1, py + 1);
        ctx.lineTo(px + kichThuoc - 1, py + kichThuoc - 1);
        ctx.lineTo(px + 1,            py + kichThuoc - 1);
        ctx.lineTo(px + 4,            py + kichThuoc - 4);
        ctx.lineTo(px + kichThuoc - 4, py + kichThuoc - 4);
        ctx.lineTo(px + kichThuoc - 4, py + 4);
        ctx.closePath();
        ctx.fill();

        // 4. Highlight bóng nhẹ ở tâm
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fillRect(px + 6, py + 6, kichThuoc - 12, kichThuoc - 12);

        // 5. Nếu ô có icon: Vẽ Huy Hiệu Bo Tròn nổi bật
        if (icon) {
            veHuyHieuIcon(ctx, px, py, kichThuoc, icon);
        }

        ctx.restore();
    }

    function veLuoiNen() {
        ngCanhBang.strokeStyle = 'rgba(12, 87, 118, 0.22)';
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

    /**
     * Vẽ toàn bộ bảng chơi:
     * ĐÃ ẨN HOÀN TOÀN ĐƯỜNG ĐI CUỐI CÙNG (GHOST PIECE) THEO YÊU CẦU NGƯỜI DÙNG!
     */
    function ve() {
        ngCanhBang.clearRect(0, 0, canvasBang.width, canvasBang.height);
        veLuoiNen();

        // Vẽ các ô đã cố định trên bảng
        for (let h = 0; h < SO_HANG; h++) {
            for (let c = 0; c < SO_COT; c++) {
                if (luoi[h][c]) {
                    veO(ngCanhBang, c, h, luoi[h][c], KICH_THUOC_O, luoiIcon ? luoiIcon[h][c] : null);
                }
            }
        }

        // Vẽ khối thật đang rơi (KHÔNG VẼ BÓNG/ĐIỂM RƠI CUỐI CÙNG NỮA)
        if (khoiHienTai && dangChoi && !ketThuc) {
            const hinh = khoiHienTai.hinh;
            for (let h = 0; h < hinh.length; h++) {
                for (let c = 0; c < hinh[h].length; c++) {
                    if (hinh[h][c]) {
                        const icon = khoiHienTai.iconGrid ? khoiHienTai.iconGrid[h][c] : null;
                        veO(ngCanhBang, khoiHienTai.x + c, khoiHienTai.y + h, hinh[h][c], KICH_THUOC_O, icon);
                    }
                }
            }
        }
    }

    function veKhoiXemTruoc() {
        ngCanhKhoi.clearRect(0, 0, canvasKhoi.width, canvasKhoi.height);
        if (!khoiTiepTheo) return;

        const hinh    = khoiTiepTheo.hinh;
        const rong    = hinh[0].length * KICH_THUOC_XEM;
        const cao     = hinh.length    * KICH_THUOC_XEM;
        const batDauX = Math.floor((canvasKhoi.width  - rong) / (2 * KICH_THUOC_XEM));
        const batDauY = Math.floor((canvasKhoi.height - cao)  / (2 * KICH_THUOC_XEM));

        for (let h = 0; h < hinh.length; h++) {
            for (let c = 0; c < hinh[h].length; c++) {
                if (hinh[h][c]) {
                    const icon = khoiTiepTheo.iconGrid ? khoiTiepTheo.iconGrid[h][c] : null;
                    veO(ngCanhKhoi, batDauX + c, batDauY + h, hinh[h][c], KICH_THUOC_XEM, icon);
                }
            }
        }
    }

    // ============================================================
    // Vòng lặp Game & Điều khiển
    // ============================================================

    function vongLapGame(thoiGian) {
        if (!dangChoi || dangDung || ketThuc) return;

        const bayGio = (typeof thoiGian === 'number' && thoiGian > 0) ? thoiGian : performance.now();
        if (!thoiGianTruoc) thoiGianTruoc = bayGio;

        const dt = bayGio - thoiGianTruoc;
        thoiGianTruoc = bayGio;

        // An toàn chống NaN và giới hạn dt hợp lý khi giật lag
        if (!isNaN(dt) && dt > 0) {
            doDem = (typeof doDem === 'number' && !isNaN(doDem) ? doDem : 0) + Math.min(dt, 250);
        } else {
            doDem = (typeof doDem === 'number' && !isNaN(doDem) ? doDem : 0);
        }

        // Luôn đảm bảo có tốc độ rơi hợp lệ cho từng màn
        const tocDoHienTai = (typeof tocDoRoi === 'number' && !isNaN(tocDoRoi) && tocDoRoi > 0)
            ? tocDoRoi
            : layTocDoRoi(capDo || 1);

        if (doDem >= tocDoHienTai) {
            roi();
            doDem = 0;
        }

        ve();
        idFrame = requestAnimationFrame(vongLapGame);
    }

    function batDauGame() {
        khoiTaoAm();

        luoi            = taoLuoi();
        luoiIcon        = taoLuoiIcon();
        diem            = 0;
        soHang          = 0;
        giayDaChoi      = 0;
        phanTuThoiGian.textContent = '00:00';
        boDemIcon       = {};
        boSuuTapDaCo.clear();
        tuiKhoi         = [];
        khoiTiepTheo    = null;
        khoiHienTai     = null;
        dangChoi        = true;
        dangDung        = false;
        ketThuc         = false;
        doDem           = 0;
        tocDoRoi        = layTocDoRoi(capDo || 1); // Đảm bảo tốc độ rơi luôn được thiết lập

        modalChienThang.classList.add('hidden');
        modalQuestWin.classList.add('hidden');
        modalGameOver.classList.add('hidden');
        thongBaoBang.classList.remove('visible');
        if (toastQua) toastQua.classList.add('hidden');
        xoaConfetti();

        capNhatGiaoDien();
        if (capDo === 3) capNhatGiaoDien10Icon();

        taoKhoiMoi();
        taoKhoiMoi();

        nutBatDau.textContent = '⏸ Tạm dừng';
        thoiGianTruoc = performance.now();
        cancelAnimationFrame(idFrame);
        idFrame = requestAnimationFrame(vongLapGame);

        clearInterval(idIntervalTimer);
        idIntervalTimer = setInterval(capNhatDongHo, 1000);
    }

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

    function batConfetti() {
        xoaConfetti();
        const mauSac = ['#00F0FF', '#7C3AED', '#FFD54F', '#FFA726', '#FF5252', '#FF2D78', '#26A69A'];
        for (let i = 0; i < 70; i++) {
            const manh = document.createElement('div');
            manh.className               = 'confetti-piece';
            manh.style.left              = Math.random() * 100 + 'vw';
            manh.style.backgroundColor   = mauSac[Math.floor(Math.random() * mauSac.length)];
            manh.style.animationDelay    = Math.random() * 0.8 + 's';
            manh.style.animationDuration = (1.8 + Math.random() * 1.5) + 's';
            document.body.appendChild(manh);
        }
    }

    function xoaConfetti() {
        document.querySelectorAll('.confetti-piece').forEach(el => el.remove());
    }

    // ============================================================
    // Event Listeners
    // ============================================================

    tabLvl1.addEventListener('click', () => datCapDo(1, true));
    tabLvl2.addEventListener('click', () => datCapDo(2, true));
    tabLvl3.addEventListener('click', () => datCapDo(3, true));

    nutBatDau.addEventListener('click', () => {
        if (!dangChoi || ketThuc) batDauGame();
        else togDung();
    });

    nutAmThanh.addEventListener('click', () => {
        khoiTaoAm();
        batAmThanh             = !batAmThanh;
        nutAmThanh.textContent = batAmThanh ? '🔊' : '🔇';
    });

    nutTiepTuc.addEventListener('click', chonTiepTuc);
    nutLevelTiep.addEventListener('click', chonLevelTiep);

    nutQuestChoiLai.addEventListener('click', () => {
        modalQuestWin.classList.add('hidden');
        xoaConfetti();
        datCapDo(3, true);
    });
    nutQuestVeDau.addEventListener('click', () => {
        modalQuestWin.classList.add('hidden');
        xoaConfetti();
        datCapDo(1, true);
    });

    nutChoiLai.addEventListener('click', () => {
        batDauGame();
    });

    window.addEventListener('keydown', (e) => {
        khoiTaoAm();

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Shift'].includes(e.key) || e.key === 'Shift') {
            e.preventDefault();
        }

        if (e.key === 'p' || e.key === 'P') { togDung(); return; }

        if (e.key === 'm' || e.key === 'M') {
            batAmThanh             = !batAmThanh;
            nutAmThanh.textContent = batAmThanh ? '🔊' : '🔇';
            return;
        }

        if (!dangChoi || dangDung || ketThuc) return;

        // Phím Shift hoặc Phím Space: Thả rơi liền ngay lập tức (Hard drop)
        if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === ' ') {
            roiNgay();
            return;
        }

        switch (e.key) {
            case 'ArrowLeft':  case 'a': case 'A': diTrai();    break;
            case 'ArrowRight': case 'd': case 'D': diPhai();    break;
            case 'ArrowUp':    case 'w': case 'W': xoayKhoi();  break;
            case 'ArrowDown':  case 's': case 'S': roiNhanh();  break;
        }
    });

    // Khởi tạo ban đầu
    datCapDo(1, false);
    ve();
    veKhoiXemTruoc();
    capNhatGiaoDien();

})();
