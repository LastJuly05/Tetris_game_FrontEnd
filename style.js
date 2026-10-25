// ============================================================
// Tetris
// ============================================================
(function () {
    'use strict';

    // ============================================================
    // DOM ELEMENTS & BIẾN TRẠNG THÁI HỆ THỐNG
    // ============================================================

    const canvasBang        = document.getElementById('board');
    const ngCanhBang        = canvasBang ? canvasBang.getContext('2d') : null;
    const canvasKhoi        = document.getElementById('next');
    const ngCanhKhoi        = canvasKhoi ? canvasKhoi.getContext('2d') : null;

    const phanTuDiem        = document.getElementById('score');
    const phanTuHang        = document.getElementById('lines');
    const phanTuCap         = document.getElementById('level');
    const phanTuThoiGian    = document.getElementById('game-time');
    const nutBatDau         = document.getElementById('start');
    const thongBaoBang      = document.getElementById('board-message');
    const moTaKhoiTiep      = document.getElementById('next-desc');

    // Cột trái
    const sectionIconList   = document.getElementById('icon-list-section');
    const iconProgressBadge = document.getElementById('icon-progress-badge');
    const sectionMission    = document.getElementById('mission-section');
    const missionTitle      = document.getElementById('mission-title');
    const missionDesc       = document.getElementById('mission-desc');
    const missionGoalLabel  = document.getElementById('mission-goal-label');
    const missionGoalVal    = document.getElementById('mission-goal-val');
    const leftProgressFill  = document.getElementById('left-progress-fill');
    const boxDaoPhim        = document.getElementById('alert-inverted-box');
    const boxChuongNgaiVat  = document.getElementById('alert-obstacle-box');
    const boxAnKhoi         = document.getElementById('alert-blind-box');
    const boxSinhTon        = document.getElementById('alert-survival-box');

    // Menu & Điều hướng màn hình
    const menuChinh         = document.getElementById('main-menu');
    const khungGame         = document.getElementById('game-container');
    const nutVeMenu         = document.getElementById('btn-back-menu');
    const textLevelHienTai  = document.getElementById('current-level-text');

    const cardLvl1          = document.getElementById('card-lvl-1');
    const cardLvl2          = document.getElementById('card-lvl-2');
    const cardLvl3          = document.getElementById('card-lvl-3');
    const cardLvl4          = document.getElementById('card-lvl-4');
    const cardLvl5          = document.getElementById('card-lvl-5');
    const cardLvl6          = document.getElementById('card-lvl-6');
    const cardLvl7          = document.getElementById('card-lvl-7');

    // Cột trái lv boss
    const sectionBoss       = document.getElementById('boss-battle-section');
    const bossPhaseTag      = document.getElementById('boss-phase-tag');
    const bossCubeAvatar    = document.getElementById('boss-cube-avatar');
    const bossEyesIcon      = document.getElementById('boss-eyes-icon');
    const bossHpNumbers     = document.getElementById('boss-hp-numbers');
    const bossHpFill        = document.getElementById('boss-hp-fill');
    const bossHpDamageBar   = document.getElementById('boss-hp-damage-bar');
    const bossCounterTimer  = document.getElementById('boss-counter-timer');
    const bossCounterFill   = document.getElementById('boss-counter-fill');
    const badgeBossShield   = document.getElementById('badge-boss-shield');
    const shieldTimer       = document.getElementById('shield-timer');
    const badgeBossLock     = document.getElementById('badge-boss-lock');
    const lockTimer         = document.getElementById('lock-timer');
    const badgeBossSpeed    = document.getElementById('badge-boss-speed');
    const bossTimeRemaining = document.getElementById('boss-time-remaining');

    // Modals
    const modalChienThang   = document.getElementById('victory-modal');
    const modalTieuDe       = document.getElementById('modal-title');
    const modalMoTa         = document.getElementById('modal-desc');
    const modalDiemCT       = document.getElementById('modal-score');
    const modalHangCT       = document.getElementById('modal-lines');
    const nutTiepTuc        = document.getElementById('btn-continue');
    const nutLevelTiep      = document.getElementById('btn-next-level');
    const nutChoiLaiTuDau   = document.getElementById('btn-replay-level');
    const nutModalMenu      = document.getElementById('btn-modal-menu');

    const modalGameOver     = document.getElementById('gameover-modal');
    const goTieuDe          = document.getElementById('go-title');
    const goMoTa            = document.getElementById('go-desc');
    const goDiem            = document.getElementById('go-score');
    const goHang            = document.getElementById('go-lines');
    const nutChoiLai        = document.getElementById('btn-restart');
    const nutGameOverMenu   = document.getElementById('btn-gameover-menu');
    const huongDanPhim      = document.getElementById('help-text');

    // Biến trạng thái trò chơi
    let luoi;
    let diem = 0;
    let soHang = 0;
    let capDo = 1;
    let mucTieuDiem = 1000;
    let daChienThangManNay = false;

    let khoiHienTai;
    let khoiTiepTheo;
    let tuiKhoi = [];
    let dangChoi = false;
    let dangDung = false;
    let ketThuc  = false;
    let doDem = 0;
    let thoiGianTruoc = 0;
    let idFrame = null;
    let tocDoRoi = 800;

    let giayDaChoi = 0;
    let idIntervalTimer = null;


    // ============================================================
    // CÁC CƠ CHẾ GAME
    // ============================================================

    // Cấu hình bảng & 7 loại khối gạch Tetris chuẩn

    const SO_COT          = 10;
    const SO_HANG         = 20;
    const KICH_THUOC_O    = 30;
    const KICH_THUOC_XEM  = 24;

    const BANG_MAU = [
        null,
        { chinh: '#00F0FF', sang: '#BCFEFE', toi: '#0099AA' }, // 1: I - Cyan
        { chinh: '#1E88E5', sang: '#90CAF9', toi: '#0D47A1' }, // 2: J - Xanh dương
        { chinh: '#FFA726', sang: '#FFE082', toi: '#E65100' }, // 3: L - Cam
        { chinh: '#FFD54F', sang: '#FFF9C4', toi: '#F57F17' }, // 4: O - Vàng
        { chinh: '#26A69A', sang: '#80CBC4', toi: '#004D40' }, // 5: S - Xanh lục
        { chinh: '#AB47BC', sang: '#CE93D8', toi: '#4A148C' }, // 6: T - Tím
        { chinh: '#FF5252', sang: '#FFCDD2', toi: '#B71C1C' }, // 7: Z - Đỏ
        { chinh: '#d9532f', sang: '#f89a7f', toi: '#8c260d' }, // 8: Gạch chướng ngại vật
        // { chinh: '#546E7A', sang: '#90A4AE', toi: '#263238' }, // 9: Dự phòng
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

    // ------------------------------------------------------------
    // Cơ chế Tốc độ rơi của khối
    // ------------------------------------------------------------
    function layTocDoRoi(cap) {
        if (cap === 1) return 800;
        if (cap === 2) return 550;
        if (cap === 3) return 500;
        if (cap === 4) return 500;
        if (cap === 5) return 140;
        if (cap === 6) return 500;
        if (cap === 7) return typeof layTocDoRoiLevel7 === 'function' ? layTocDoRoiLevel7() : 450;
        return 350;
    }

    // ------------------------------------------------------------
    // Cơ chế Vẽ ô lưới & Khối gạch
    // ------------------------------------------------------------

    /** Vẽ các đường kẻ lưới nền của bảng */
    function veLuoiNen() {
        if (!ngCanhBang) return;
        ngCanhBang.strokeStyle = '#f5f1f1';
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

    /** Vẽ một ô khối lên canvas */
    function veO(ctx, x, y, mauId, kichThuoc, icon = null) {
        const mau = BANG_MAU[mauId];
        if (!mau || !ctx) return;

        const px = x * kichThuoc;
        const py = y * kichThuoc;

        ctx.save();

        // Thân khối màu chính
        ctx.fillStyle = mau.chinh;
        ctx.fillRect(px + 1, py + 1, kichThuoc - 2, kichThuoc - 2);

        // Viền sáng góc
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

        // Góc tối
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

        // Vẽ huy hiệu icon cho ô có icon
        if (icon) {
            if (icon === '💣' && typeof veHuyHieuBomLevel3 === 'function') {
                veHuyHieuBomLevel3(ctx, px, py, kichThuoc, x, y);
            } else if (typeof veHuyHieuIconLevel4 === 'function') {
                veHuyHieuIconLevel4(ctx, px, py, kichThuoc, icon);
            }
        }

        //  Vẽ hoa văn gạch với hp=1
        if (mauId === 8) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            // các đương vẽ viền vữa của gạch
            ctx.moveTo(px + 2, py + Math.floor(kichThuoc / 2));
            ctx.lineTo(px + kichThuoc - 2, py + Math.floor(kichThuoc / 2));

            ctx.moveTo(px + Math.floor(kichThuoc / 2), py + 2);
            ctx.lineTo(px + Math.floor(kichThuoc / 2), py + Math.floor(kichThuoc / 2));

            ctx.moveTo(px + Math.floor(kichThuoc / 4), py + Math.floor(kichThuoc / 2));
            ctx.lineTo(px + Math.floor(kichThuoc / 4), py + kichThuoc - 2);
            ctx.moveTo(px + Math.floor(kichThuoc * 3 / 4), py + Math.floor(kichThuoc / 2));
            ctx.lineTo(px + Math.floor(kichThuoc * 3 / 4), py + kichThuoc - 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    /* UI bảng chơi */

    function ve() {
        if (!ngCanhBang || !canvasBang) return;
        ngCanhBang.clearRect(0, 0, canvasBang.width, canvasBang.height);
        veLuoiNen();

        // Vẽ các ô đã cố định trên bảng
        // ở Màn 6 sẽ bị ẩn;
        // chỉ hiện trong 0.75s khi thả rơi tức thì.
        const choPhepVeGach = (capDo === 6 && typeof coHienGachCoDinhLevel6 === 'function')
            ? coHienGachCoDinhLevel6()
            : true;

        if (choPhepVeGach) {
            for (let h = 0; h < SO_HANG; h++) {
                for (let c = 0; c < SO_COT; c++) {
                    if (luoi[h][c]) {
                        const icon = (typeof luoiIcon !== 'undefined' && luoiIcon) ? luoiIcon[h][c] : null;
                        veO(ngCanhBang, c, h, luoi[h][c], KICH_THUOC_O, icon);
                    }
                }
            }
        }

        // Khối vật đang rơi
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

        // Hiệu ứng nổ bom Level 3
        if (capDo === 3 && typeof veHieuUngNoLevel3 === 'function') {
            veHieuUngNoLevel3(ngCanhBang);
        }

        // Vẽ hiệu ứng tấn công & cảnh báo phản công của Màn 7 (Boss)
        if (capDo === 7 && typeof veHieuUngLevel7 === 'function') {
            veHieuUngLevel7(ngCanhBang);
        }
    }

    /** Khối tiếp theo trong khung Preview */
    function veKhoiXemTruoc() {
        if (!ngCanhKhoi || !canvasKhoi) return;
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

    // Cơ chế Tạo lưới & Tạo khối Tetris

    /** Tạo mảng lưới 10x20 */
    function taoLuoi() {
        return Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(0));
    }

    /** Random khối tiếp theo theo cơ chế túi 7 khối  */
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

    /** Khởi tạo đối tượng khối Tetris mới */
    function taoKhoi(loai) {
        const hinh = HINH_KHOI[loai].map(hang => [...hang]);
        const N = hinh.length;
        const iconGrid = Array.from({ length: N }, () => Array(N).fill(null));

        const khoi = {
            loai,
            hinh,
            iconGrid,
            x: Math.floor((SO_COT - hinh[0].length) / 2),
            y: 0
        };

        // Cơ chế sinh icon Bom riêng của Level 3
        if (capDo === 3 && typeof ganIconBomLevel3 === 'function') {
            ganIconBomLevel3(khoi);
        }

        // Cơ chế sinh icon riêng của Level 4
        if (capDo === 4 && typeof ganIconLevel4 === 'function') {
            ganIconLevel4(khoi);
        }

        return khoi;
    }

    // Cơ chế Kiểm tra va chạm

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
        return dangChoi && !dangDung && !ketThuc && khoiHienTai && !dangRoiTrongLucLevel3;
    }

    // Cơ chế Xoay khối (Rotate Matrix & Wall Kick)
    /** Thuật toán xoay ma trận 90 độ theo chiều kim đồng hồ */

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

    /** Xoay khối với các bước kiểm tra Wall Kick */
    function xoayKhoi() {
        if (!coTheDieuKhien()) return;
        if (khoiHienTai.loai === 4) return; // Khối chữ O không cần xoay

        const hinhXoay = xoayMaTran(khoiHienTai.hinh, 0);
        const iconXoay = xoayMaTran(khoiHienTai.iconGrid, null);
        const cachKick = [[0,0], [-1,0], [1,0], [-2,0], [2,0], [0,-1]];

        for (const [lx, ly] of cachKick) {
            if (!vaChạm(khoiHienTai, lx, ly, hinhXoay)) {
                khoiHienTai.hinh     = hinhXoay;
                khoiHienTai.iconGrid = iconXoay;
                khoiHienTai.x       += lx;
                khoiHienTai.y       += ly;
                ve();
                return;
            }
        }
    }
    // Cơ chế Di chuyển ngang cơ bản (Trái / Phải)

    function diTraiThucTe() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, -1, 0)) {
            khoiHienTai.x--;
            ve();
        }
    }

    function diPhaiThucTe() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, 1, 0)) {
            khoiHienTai.x++;
            ve();
        }
    }

    // Cơ chế Rơi của khối: Tự nhiên, Rơi nhanh, Rơi tức thì
    /** Rơi tự nhiên theo nhịp trọng lực */

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

    // Rơi nhanh (Soft Drop)
    // Cứ rơi 1 ô và được cộng 1 điểm



    function roiNhanh() {
        if (!coTheDieuKhien()) return;
        if (!vaChạm(khoiHienTai, 0, 1)) {
            khoiHienTai.y++;
            congDiem(1);
            doDem = 0;
            ve();
        } else {
            khoaKhoi();
        }
    }

    // Rơi ngay lập tức (Hard Drop)
    // Thả rơi xuống đáy lập tức và cộng điểm
    function roiNgay() {
        if (!coTheDieuKhien()) return;
        let soO = 0;
        while (!vaChạm(khoiHienTai, 0, 1)) {
            khoiHienTai.y++;
            soO++;
        }
        congDiem(soO * 2);
        khoaKhoi();

        // Lv 6: Thả rơi tức thì sẽ làm hiện tất cả gạch trong 0.75s
        if (capDo === 6 && typeof kichHoatHienGachLevel6 === 'function') {
            kichHoatHienGachLevel6();
        }
    }

    // Cơ chế Khóa khối, Xóa hàng & Xuất khối mới
    // Khóa khối vào lưới bảng khi chạm đáy hoặc chạm khối khác

    function khoaKhoi() {
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
                if (typeof luoiIcon !== 'undefined' && luoiIcon && khoiHienTai.iconGrid && khoiHienTai.iconGrid[h][c]) {
                    luoiIcon[ly][lx] = khoiHienTai.iconGrid[h][c];
                }
            }
        }

        // Lv3: Bom nổ kèm theo Cơ chế trọng lực rơi khối lơ lửng
        if (capDo === 3) {
            khoiHienTai = null;

            // Kiểm tra gom đủ từ 3 quả bom kề nhau thì kích nổ Siêu Bom 4x4
            if (typeof kiemTraVaKichNoCumBomLevel3 === 'function') {
                kiemTraVaKichNoCumBomLevel3();
            }

            //Xóa các hàng đã đầy
            xoaHangDay();

            // Cơ chế trọng lực: Khối gạch người chơi lơ lửng không có điểm tựa sẽ rơi xuống
            if (typeof thucHienRoiTrongLucLevel3 === 'function') {
                thucHienRoiTrongLucLevel3(() => {
                    taoKhoiMoi();
                });
                return;
            }

            taoKhoiMoi();
            return;
        }

        xoaHangDay();
        taoKhoiMoi();
    }

    // Kiểm tra và xóa các hàng đã lấp đầy,
    // Tính điểm thưởng
    function xoaHangDay() {
        let soHangXoa = 0;
        const iconThuThapTrongLuot = [];

        for (let h = SO_HANG - 1; h >= 0; h--) {
            if (luoi[h].every(o => o !== 0)) {

                // lv3: Xử lý phá gạch chướng ngại vật & bom khi đầy hàng
                if (capDo === 3 && typeof luoiDoVat !== 'undefined' && luoiDoVat) {
                    const bomTrongHang = [];
                    for (let c = 0; c < SO_COT; c++) {
                        if (luoiDoVat[h][c] > 0) {
                            // Gạch thường hp=1 đầy hàng || bom nổ sẽ vỡ ngay tức thì
                            luoiDoVat[h][c] = 0;
                            soVatDaPha++;
                            luoi[h][c] = 0;
                        }
                        if (typeof luoiIcon !== 'undefined' && luoiIcon && luoiIcon[h][c] === '💣') {
                            bomTrongHang.push({ x: c, y: h });
                            luoiIcon[h][c] = null;
                        }
                    }
                    capNhatTienDoChuongNgaiVat();

                    // Kích nổ bom nếu có bom nằm trong hàng vừa lấp đầy
                    if (bomTrongHang.length > 0 && typeof kichNoBomDonLeLevel3 === 'function') {
                        kichNoBomDonLeLevel3(bomTrongHang);
                    }
                }

                // Thu thập icon lv4
                for (let c = 0; c < SO_COT; c++) {
                    if (typeof luoiIcon !== 'undefined' && luoiIcon && luoiIcon[h][c]) {
                        iconThuThapTrongLuot.push(luoiIcon[h][c]);
                    }
                }

                // Xóa hàng bình thường
                luoi.splice(h, 1);
                luoi.unshift(Array(SO_COT).fill(0));

                if (typeof luoiIcon !== 'undefined' && luoiIcon) {
                    luoiIcon.splice(h, 1);
                    luoiIcon.unshift(Array(SO_COT).fill(null));
                }

                // Đồng bộ lưới chướng ngại vật khi splice lv3
                if (capDo === 3 && typeof luoiDoVat !== 'undefined' && luoiDoVat) {
                    luoiDoVat.splice(h, 1);
                    luoiDoVat.unshift(Array(SO_COT).fill(0));
                }

                soHangXoa++;
                h++;
            }
        }

        if (soHangXoa === 0) return;

        soHang += soHangXoa;
        const bangDiem = [0, 100, 300, 500, 800];
        congDiem((bangDiem[soHangXoa] || soHangXoa * 200) * capDo);

        // Sau khi các hàng sụt xuống, kiểm tra nếu rơi thành cụm 3 bom kề nhau thì kích nổ 4x4
        if (capDo === 3 && typeof kiemTraVaKichNoCumBomLevel3 === 'function') {
            kiemTraVaKichNoCumBomLevel3();
        }

        // Xử lý thu thập icon ở lv4
        if (capDo === 4 && iconThuThapTrongLuot.length > 0 && typeof xuLyThuThap10IconLevel4 === 'function') {
            xuLyThuThap10IconLevel4(iconThuThapTrongLuot);
        }

        // Kiểm tra chiến thắng lv3: Phá hết chướng ngại vật
        if (capDo === 3 && typeof kiemTraChienThangLevel3 === 'function') {
            kiemTraChienThangLevel3();
        }

        // Tấn công Boss khi xóa hàng ở lv7
        if (capDo === 7 && typeof tanCongBossLevel7 === 'function') {
            tanCongBossLevel7(soHangXoa);
        }

        capNhatGiaoDien();
    }

    // Xuất khối tiếp theo vào bảng chơi và chuẩn bị khối xem trước mới
    function taoKhoiMoi() {
        if (!khoiTiepTheo) khoiTiepTheo = taoKhoi(layLoaiKhoiTiep());
        khoiHienTai  = khoiTiepTheo;
        khoiTiepTheo = taoKhoi(layLoaiKhoiTiep());

        if (moTaKhoiTiep) {
            let ten = TEN_KHOI[khoiTiepTheo.loai] || 'Khối Tetris';
            let moTaIcon = null;
            if (capDo === 3 && typeof layMoTaBomLevel3 === 'function') {
                moTaIcon = layMoTaBomLevel3(khoiTiepTheo);
            } else if (capDo === 4 && typeof layMoTaIconLevel4 === 'function') {
                moTaIcon = layMoTaIconLevel4(khoiTiepTheo);
            }

            if (moTaIcon) {
                moTaKhoiTiep.textContent = `${ten} (${moTaIcon})`;
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

    // Cơ chế Vòng lặp game cốt lõi (Game Loop)

    function vongLapGame(thoiGian) {
        if (!dangChoi || dangDung || ketThuc) return;

        const bayGio = (typeof thoiGian === 'number' && thoiGian > 0) ? thoiGian : performance.now();
        if (!thoiGianTruoc) thoiGianTruoc = bayGio;

        const dt = bayGio - thoiGianTruoc;
        thoiGianTruoc = bayGio;

        // Hàm NaN
        if (!isNaN(dt) && dt > 0) {
            doDem = (typeof doDem === 'number' && !isNaN(doDem) ? doDem : 0) + Math.min(dt, 250);
        } else {
            doDem = (typeof doDem === 'number' && !isNaN(doDem) ? doDem : 0);
        }

        // Tốc độ rơi hợp lệ cho từng màn
        const tocDoHienTai = (typeof tocDoRoi === 'number' && !isNaN(tocDoRoi) && tocDoRoi > 0)
            ? tocDoRoi
            : layTocDoRoi(capDo || 1);

        if (doDem >= tocDoHienTai) {
            if (!dangRoiTrongLucLevel3) {
                roi();
            }
            doDem = 0;
        }

        ve();
        idFrame = requestAnimationFrame(vongLapGame);
    }

    function batDauGame() {
        luoi            = taoLuoi();
        diem            = 0;
        soHang          = 0;
        giayDaChoi      = 0;
        if (phanTuThoiGian) phanTuThoiGian.textContent = '00:00';

        dangRoiTrongLucLevel3 = false;
        dsBuiHaCanhLevel3     = [];
        daChienThangManNay = false;
        tuiKhoi         = [];
        khoiTiepTheo    = null;
        khoiHienTai     = null;
        dangChoi        = true;
        dangDung        = false;
        ketThuc         = false;
        doDem           = 0;
        tocDoRoi        = layTocDoRoi(capDo || 1);

        // Trạng thái riêng của Lv3: hp
        if (capDo === 3 && typeof khoiTaoLevel3ChuongNgaiVat === 'function') {
            khoiTaoLevel3ChuongNgaiVat();
        }

        // Trạng thái riêng của Lv4
        if (capDo === 4 && typeof khoiTaoTrangThaiLevel4 === 'function') {
            khoiTaoTrangThaiLevel4();
        }

        // Trạng thái riêng của Lv6
        if (capDo === 6 && typeof datLaiTrangThaiLevel6 === 'function') {
            datLaiTrangThaiLevel6();
        }

        // Trạng thái riêng của Lv7
        if (capDo === 7 && typeof khoiTaoLevel7Boss === 'function') {
            khoiTaoLevel7Boss();
        }

        if (modalChienThang) modalChienThang.classList.add('hidden');
        if (modalGameOver) modalGameOver.classList.add('hidden');
        if (thongBaoBang) thongBaoBang.classList.remove('visible');

        capNhatGiaoDien();
        if (capDo === 4 && typeof capNhatGiaoDien10Icon === 'function') {
            capNhatGiaoDien10Icon();
        }

        taoKhoiMoi();
        taoKhoiMoi();

        if (nutBatDau) nutBatDau.textContent = '⏸ Tạm dừng';
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
            if (thongBaoBang) thongBaoBang.classList.add('visible');
            if (nutBatDau) nutBatDau.textContent = '▶ Tiếp tục';
            cancelAnimationFrame(idFrame);
        } else {
            if (thongBaoBang) thongBaoBang.classList.remove('visible');
            if (nutBatDau) nutBatDau.textContent = '⏸ Tạm dừng';
            thoiGianTruoc = performance.now();
            idFrame       = requestAnimationFrame(vongLapGame);
        }
    }


// CÁC CƠ CHẾ ĐƯỢC THÊM RIÊNG CHO TỪNG LEVEL

    // CƠ CHẾ LV: THỬ THÁCH CỔ ĐIỂN
    // Mục tiêu: 1000 điểm
    // Tốc độ rơi: 800ms
    const MUC_TIEU_LV1 = 1000;
    const TOC_DO_LV1   = 800;

    function thietLapLevel1() {
        mucTieuDiem = MUC_TIEU_LV1;
        tocDoRoi    = TOC_DO_LV1;
        if (typeof datLaiTrangThaiLevel6 === 'function') datLaiTrangThaiLevel6();

        if (sectionIconList)  sectionIconList.classList.add('hidden');
        if (sectionMission)   sectionMission.classList.remove('hidden');
        if (boxDaoPhim)       boxDaoPhim.classList.add('hidden');
        if (boxChuongNgaiVat) boxChuongNgaiVat.classList.add('hidden');
        if (boxSinhTon)       boxSinhTon.classList.add('hidden');
        if (boxAnKhoi)        boxAnKhoi.classList.add('hidden');

        if (missionTitle)     missionTitle.textContent     = 'MÀN 1: THỬ THÁCH CỔ ĐIỂN';
        if (missionDesc)      missionDesc.textContent      = 'Cách chơi Tetris cơ bản. Đạt 1000 điểm để mở khóa Màn 2.';
        if (missionGoalLabel) missionGoalLabel.textContent = 'Điểm mục tiêu';

        capNhatHelpTextChung(false);
    }

    // CƠ CHẾ LEVEL 2: THỬ THÁCH ĐẢO NGƯỢC (TRÁI ⇄ PHẢI)
    // Mục tiêu: 2000 điểm
    // Tốc độ rơi: 550ms
    // Cơ chế riêng: Nhấn phím Trái thì khối sang Phải, nhấn Phải thì khối sang Trái
    const MUC_TIEU_LV2 = 2000;
    const TOC_DO_LV2   = 550;

    // Cơ chế đảo chiều phím Trái ➔ Phải ở Level 2
    function diTraiLevel2() {
        diPhaiThucTe();
    }

    // Cơ chế đảo chiều phím Phải ➔ Trái ở Level 2
    function diPhaiLevel2() {
        diTraiThucTe();
    }

    function capNhatHelpTextLevel2() {
        if (!huongDanPhim) return;
        huongDanPhim.innerHTML = `
            <div class="help-item help-inverted-hint"><span>← (Trái)</span> : Sang PHẢI ➔</div>
            <div class="help-item help-inverted-hint"><span>→ (Phải)</span> : Sang TRÁI ⬅</div>
            <div class="help-item"><span>↑</span> : Xoay khối gạch</div>
            <div class="help-item"><span>↓</span> : Rơi nhanh (Soft drop)</div>
            <div class="help-item"><span>Shift / Space</span> : Thả rơi liền</div>
            <div class="help-item"><span>P</span> : Tạm dừng</div>
        `;
    }

    function thietLapLevel2() {
        mucTieuDiem = MUC_TIEU_LV2;
        tocDoRoi    = TOC_DO_LV2;
        if (typeof datLaiTrangThaiLevel6 === 'function') datLaiTrangThaiLevel6();

        if (sectionIconList)  sectionIconList.classList.add('hidden');
        if (sectionMission)   sectionMission.classList.remove('hidden');
        if (boxDaoPhim)       boxDaoPhim.classList.remove('hidden');
        if (boxChuongNgaiVat) boxChuongNgaiVat.classList.add('hidden');
        if (boxSinhTon)       boxSinhTon.classList.add('hidden');
        if (boxAnKhoi)        boxAnKhoi.classList.add('hidden');

        if (missionTitle)     missionTitle.textContent     = 'MÀN 2: THỬ THÁCH ĐẢO NGƯỢC';
        if (missionDesc)      missionDesc.textContent      = 'Phím Trái và Phải bị đảo ngược. Đạt 2000 điểm để qua màn.';
        if (missionGoalLabel) missionGoalLabel.textContent = 'Điểm mục tiêu';

        capNhatHelpTextLevel2();
    }

    // CƠ CHẾ LEVEL 3: THỬ THÁCH CHƯỚNG NGẠI VẬT & SIÊU BOM 4X4
    // Mục tiêu: Phá hủy TẤT CẢ gạch chướng ngại vật (không dựa vào điểm số)
    // Tốc độ rơi: 500ms
    // -Cơ chế riêng: +Gạch thường ; Cơ chế Bom;+ Bom rơi xuống chưa đc kích nổ;
    // +Gạch cơ bản đc cài 4b; +KÍCH NỔ SIÊU BOM DIỆN RỘNG 4X4;
    // +Thắng khi quét sạch bom
    // ------------------------------------------------------------
    const TOC_DO_LV3 = 500;

    // Lưới HP chướng ngại vật: 0 = không có, 1 = HP còn lại của gạch
    let luoiDoVat = null;
    let tongSoVatCanPha = 0;
    let soVatDaPha      = 0;
    let dsHieuUngNo     = [];
    let dangRoiTrongLucLevel3 = false;
    let dsBuiHaCanhLevel3     = [];

    // Khởi tạo trạng thái Level 3

    function khoiTaoLevel3ChuongNgaiVat() {
        luoiDoVat = Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(0));
        if (typeof luoiIcon !== 'undefined') {
            luoiIcon = Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(null));
        }
        dsHieuUngNo           = [];
        dsBuiHaCanhLevel3     = [];
        dangRoiTrongLucLevel3 = false;
        tongSoVatCanPha       = 0;
        soVatDaPha            = 0;

        const SO_HANG_RAO = 4; //thay đổi để tăng số lượng hàng gạch
        const danhSachGach = [];

        for (let i = 0; i < SO_HANG_RAO; i++) {
            const h = SO_HANG - SO_HANG_RAO + i;
            const soLoTrong = 2 + Math.floor(Math.random() * 2);
            const cacCotTrong = new Set();
            while (cacCotTrong.size < soLoTrong) {
                cacCotTrong.add(Math.floor(Math.random() * SO_COT));
            }

            for (let c = 0; c < SO_COT; c++) {
                if (cacCotTrong.has(c)) {
                    luoi[h][c]     = 0;
                    luoiDoVat[h][c] = 0;
                    continue;
                }

                luoi[h][c]     = 8;
                luoiDoVat[h][c] = 1;
                tongSoVatCanPha++;
                danhSachGach.push({ r: h, c: c });
            }
        }

        // Tao co che sẵn bomẻ ngầm
        if (typeof luoiIcon !== 'undefined' && luoiIcon) {
            for (let k = 0; k < 4 && danhSachGach.length > 0; k++) {
                const idx = Math.floor(Math.random() * danhSachGach.length);
                const oChon = danhSachGach.splice(idx, 1)[0];
                luoiIcon[oChon.r][oChon.c] = '💣';
            }
        }
    }

    // Cơ chế random Bom ~60%
    function ganIconBomLevel3(khoi) {
        if (!khoi || !khoi.hinh || !khoi.iconGrid) return;
        const coBom = Math.random() < 0.60;
        if (!coBom) return;

        const hinh = khoi.hinh;
        const N = hinh.length;
        const oHopLe = [];

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                if (hinh[r][c] !== 0) oHopLe.push({ r, c });
            }
        }

        if (oHopLe.length > 0) {
            const oChon = oHopLe[Math.floor(Math.random() * oHopLe.length)];
            khoi.iconGrid[oChon.r][oChon.c] = '💣';
        }
    }

    // Lấy mô tả icon Bom Nổ trong khối xem trước
    function layMoTaBomLevel3(khoi) {
        if (!khoi || !khoi.iconGrid) return null;
        for (let r = 0; r < khoi.iconGrid.length; r++) {
            for (let c = 0; c < khoi.iconGrid[r].length; c++) {
                if (khoi.iconGrid[r][c] === '💣') {
                    return '💣 Bom Nổ (Gom 3 cái nổ 4x4)';
                }
            }
        }
        return null;
    }

    // Đếm số lượng quả bom kề cạnh ô r&c
    function demBomLienKe(r, c) {
        if (typeof luoiIcon === 'undefined' || !luoiIcon) return 0;
        let dem = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < SO_HANG && nc >= 0 && nc < SO_COT) {
                    if (luoiIcon[nr][nc] === '💣') dem++;
                }
            }
        }
        return dem;
    }

    // Vẽ huy hiệu bom trên ô gạch
    function veHuyHieuBomLevel3(ctx, px, py, kichThuoc, gridX = null, gridY = null) {
        const margin = Math.max(2, Math.round(kichThuoc * 0.08));
        const bx = px + margin;
        const by = py + margin;
        const bw = kichThuoc - margin * 2;
        const bh = kichThuoc - margin * 2;

        const soLienKe = (gridX !== null && gridY !== null)
            ? demBomLienKe(gridY, gridX)
            : 0;

        ctx.save();

        // Nếu đã có bom kề cạnh viền đỏ rực cảnh báo =2bom
        if (soLienKe >= 1) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.beginPath();
            ctx.arc(bx + bw / 2, by + bh / 2, bw / 2 + 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
        }

        // Vòng tròn nền than tối
        ctx.fillStyle = 'rgba(24, 24, 27, 0.94)';
        ctx.beginPath();
        ctx.arc(bx + bw / 2, by + bh / 2, bw / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const fontSize = Math.round(bw * 0.65);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💣', bx + bw / 2, by + bh / 2 + 1);

        //Chấm sáng liên kết
        if (soLienKe >= 1) {
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(bx + bw - 3, by + 3, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Thuật toán tìm các cụm bom liền kề nhau
    // Trả về danh sách các cụm có >=3
    function timCacCumBomLienKe() {
        if (typeof luoiIcon === 'undefined' || !luoiIcon) return [];
        const daDuyet = Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(false));
        const cacCum = [];

        for (let h = 0; h < SO_HANG; h++) {
            for (let c = 0; c < SO_COT; c++) {
                if (luoiIcon[h][c] === '💣' && !daDuyet[h][c]) {
                    const cum = [];
                    const hangDoi = [{ r: h, c: c }];
                    daDuyet[h][c] = true;

                    while (hangDoi.length > 0) {
                        const curr = hangDoi.shift();
                        cum.push(curr);

                        // Kiểm tra các hướng xung quanh (ngang, dọc, chéo)
                        for (let dr = -1; dr <= 1; dr++) {
                            for (let dc = -1; dc <= 1; dc++) {
                                if (dr === 0 && dc === 0) continue;
                                const nr = curr.r + dr;
                                const nc = curr.c + dc;
                                if (nr >= 0 && nr < SO_HANG && nc >= 0 && nc < SO_COT) {
                                    if (luoiIcon[nr][nc] === '💣' && !daDuyet[nr][nc]) {
                                        daDuyet[nr][nc] = true;
                                        hangDoi.push({ r: nr, c: nc });
                                    }
                                }
                            }
                        }
                    }
                    if (cum.length >= 3) {
                        cacCum.push(cum);
                    }
                }
            }
        }
        return cacCum;
    }

    // Cách thức Kích nổ Bom4x4

    function kichNoCumBom4x4(cumBom) {
        if (!cumBom || cumBom.length < 3) return;

        let minR = SO_HANG, maxR = -1, minC = SO_COT, maxC = -1;
        for (const b of cumBom) {
            if (b.r < minR) minR = b.r;
            if (b.r > maxR) maxR = b.r;
            if (b.c < minC) minC = b.c;
            if (b.c > maxC) maxC = b.c;
        }

        const centerR = Math.round((minR + maxR) / 2);
        const centerC = Math.round((minC + maxC) / 2);

        // Xác định phạm vi nổ bao quát ít nhất 4 hàng x 4 cột quanh tâm cụm bom
        const rDau  = Math.max(0, Math.min(minR - 1, centerR - 2));
        const rCuoi = Math.min(SO_HANG - 1, Math.max(maxR + 1, centerR + 1));
        const cDau  = Math.max(0, Math.min(minC - 1, centerC - 2));
        const cCuoi = Math.min(SO_COT - 1, Math.max(maxC + 1, centerC + 1));
        let soGachPha = 0;

        for (let r = rDau; r <= rCuoi; r++) {
            for (let c = cDau; c <= cCuoi; c++) {
                // Phá hủy gạch chướng ngại vật trong vùng 4x4
                if (luoiDoVat && luoiDoVat[r][c] > 0) {
                    luoiDoVat[r][c] = 0;
                    soVatDaPha++;
                    soGachPha++;
                }

                // Tiêu biến các quả bom và khối trong vùng nổ
                luoi[r][c] = 0;
                if (typeof luoiIcon !== 'undefined' && luoiIcon) {
                    luoiIcon[r][c] = null;
                }
            }
        }

        // Thưởng điểm nổ
        congDiem(soGachPha * 150 + 500);

        // Tọa độ tâm vụ nổ canvas
        const cx = ((cDau + cCuoi + 1) / 2) * KICH_THUOC_O;
        const cy = ((rDau + rCuoi + 1) / 2) * KICH_THUOC_O;

        dsHieuUngNo.push({
            cx,
            cy,
            banKinhToiDa: KICH_THUOC_O * 3.8,
            batDau: performance.now(),
            thoiLuong: 550,
            soGach: soGachPha,
            laSieuNo: true,
            hat: taoHatNo(cx, cy, 24)
        });

        // hiệu ưngs đi kèm vs nổ220ms
        rungBangChoi(220);

        capNhatTienDoChuongNgaiVat();
        kiemTraChienThangLevel3();
    }

    // Kiểm tra và kích nổ tất cả cụm có từ 3 quả bom kề nhau
    function kiemTraVaKichNoCumBomLevel3() {
        if (capDo !== 3) return false;
        let coNo = false;
        let tiepTuc = true;
        let demVong = 0;

        while (tiepTuc && demVong < 5) {
            demVong++;
            const cacCum = timCacCumBomLienKe();
            if (cacCum.length === 0) {
                tiepTuc = false;
                break;
            }
            for (const cum of cacCum) {
                kichNoCumBom4x4(cum);
                coNo = true;
            }
        }
        return coNo;
    }

    // Kích nổ quả bom đơn lẻ khi một hàng chứa bom được lấp đầy và xóa (3x3)
    function kichNoBomDonLeLevel3(danhSachBom) {
        if (!danhSachBom || danhSachBom.length === 0) return;

        let soGachPha = 0;

        for (const bom of danhSachBom) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = bom.y + dr;
                    const nc = bom.x + dc;
                    if (nr < 0 || nr >= SO_HANG || nc < 0 || nc >= SO_COT) continue;

                    if (luoiDoVat && luoiDoVat[nr][nc] > 0) {
                        luoiDoVat[nr][nc] = 0;
                        luoi[nr][nc] = 0;
                        soVatDaPha++;
                        soGachPha++;
                    }
                }
            }

            const cx = (bom.x + 0.5) * KICH_THUOC_O;
            const cy = (bom.y + 0.5) * KICH_THUOC_O;
            dsHieuUngNo.push({
                cx,
                cy,
                banKinhToiDa: KICH_THUOC_O * 2.2,
                batDau: performance.now(),
                thoiLuong: 400,
                soGach: soGachPha,
                laSieuNo: false,
                hat: taoHatNo(cx, cy, 14)
            });
        }

        if (soGachPha > 0) {
            congDiem(soGachPha * 100 + 80);
        }

        rungBangChoi(140);
        capNhatTienDoChuongNgaiVat();
        kiemTraChienThangLevel3();
    }

    // Tạo chùm tia lửa bay ra từ tâm vụ nổ
    function taoHatNo(cx, cy, soLuong = 14) {
        const cacHat = [];
        const cacMau = ['#ffeb3b', '#ff9800', '#f44336', '#ffffff', '#ff5722'];
        for (let i = 0; i < soLuong; i++) {
            const goc = (Math.PI * 2 * i) / soLuong + (Math.random() - 0.5) * 0.5;
            const tocDo = 1.5 + Math.random() * 3.5;
            cacHat.push({
                x: cx,
                y: cy,
                vx: Math.cos(goc) * tocDo,
                vy: Math.sin(goc) * tocDo,
                mau: cacMau[Math.floor(Math.random() * cacMau.length)],
                kichThuoc: 2.5 + Math.random() * 3.0
            });
        }
        return cacHat;
    }

    // Rung nhẹ bảng chơi khi có bom nổ tạo cảm giác chấn động
    function rungBangChoi(thoiGianMs = 120) {
        if (!canvasBang) return;
        const dx = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 3.5);
        const dy = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 3.5);
        canvasBang.style.transform = `translate(${dx}px, ${dy}px)`;
        setTimeout(() => {
            if (canvasBang) canvasBang.style.transform = 'none';
        }, thoiGianMs);
    }

    // Thuật toán tìm các ô gạch người chơi lơ lửng không có điểm tựa
    function timCacOPlayerKhongDiemTua() {
        if (capDo !== 3) return [];

        const coDiemTua = Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(false));
        const hangDoi = [];

        // 1. Xác định các hạt giống điểm tựa (Grounded Seeds)
        for (let r = 0; r < SO_HANG; r++) {
            for (let c = 0; c < SO_COT; c++) {
                if (luoi[r][c] === 0) continue;

                const laChuongNgaiVat = (luoiDoVat && luoiDoVat[r][c] > 0) || luoi[r][c] === 8;
                if (laChuongNgaiVat) {
                    // Khối chướng ngại vật cố định luôn là điểm tựa kiên cố
                    coDiemTua[r][c] = true;
                    hangDoi.push({ r, c });
                    continue;
                }

                if (r === SO_HANG - 1) {
                    // Ô nằm ở hàng đáy bảng (hàng 19) được sàn nhà nâng đỡ
                    coDiemTua[r][c] = true;
                    hangDoi.push({ r, c });
                    continue;
                }

                if (r + 1 < SO_HANG) {
                    const benDuoiLaChuongNgai = (luoiDoVat && luoiDoVat[r + 1][c] > 0) || luoi[r + 1][c] === 8;
                    if (benDuoiLaChuongNgai) {
                        // Khối người chơi đặt trực tiếp trên khối đá/chướng ngại vật
                        coDiemTua[r][c] = true;
                        hangDoi.push({ r, c });
                    }
                }
            }
        }

        // 2. Lan truyền điểm tựa qua kết cấu liên kết (BFS 4 hướng)
        const huong = [
            { dr: -1, dc: 0 },
            { dr: 1,  dc: 0 },
            { dr: 0,  dc: -1 },
            { dr: 0,  dc: 1 }
        ];

        while (hangDoi.length > 0) {
            const { r, c } = hangDoi.shift();

            for (const { dr, dc } of huong) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < SO_HANG && nc >= 0 && nc < SO_COT) {
                    if (luoi[nr][nc] !== 0 && !coDiemTua[nr][nc]) {
                        coDiemTua[nr][nc] = true;
                        hangDoi.push({ r: nr, c: nc });
                    }
                }
            }
        }

        // 3. Thu thập tất cả các ô gạch người chơi KHÔNG có điểm tựa
        const cacOKhongDiemTua = [];
        for (let r = 0; r < SO_HANG; r++) {
            for (let c = 0; c < SO_COT; c++) {
                if (luoi[r][c] !== 0 && !coDiemTua[r][c]) {
                    const laChuongNgaiVat = (luoiDoVat && luoiDoVat[r][c] > 0) || luoi[r][c] === 8;
                    if (!laChuongNgaiVat) {
                        cacOKhongDiemTua.push({ r, c });
                    }
                }
            }
        }

        return cacOKhongDiemTua;
    }

    // Hiệu ứng rơi từng bước của các khối lơ lửng không có điểm tựa
    function thucHienRoiTrongLucLevel3(callback) {
        if (capDo !== 3) {
            if (typeof callback === 'function') callback();
            return;
        }

        const cacODauTien = timCacOPlayerKhongDiemTua();
        if (cacODauTien.length === 0) {
            dangRoiTrongLucLevel3 = false;
            if (typeof callback === 'function') callback();
            return;
        }

        dangRoiTrongLucLevel3 = true;

        // Nếu vừa có vụ nổ bom, chờ 180ms để sóng xung kích nổ bung ra trước khi gạch rơi vào hố
        const doTreBanDau = dsHieuUngNo.length > 0 ? 180 : 20;

        function buocRoi() {
            if (!dangChoi || ketThuc) {
                dangRoiTrongLucLevel3 = false;
                return;
            }

            const danhSachHienTai = timCacOPlayerKhongDiemTua();
            if (danhSachHienTai.length === 0) {
                ketThucRoiTrongLucLevel3(callback);
                return;
            }

            // Sắp xếp từ dưới lên trên để ô dưới rơi trước, không bị ghi đè ô trên
            danhSachHienTai.sort((a, b) => b.r - a.r);

            let coRoi = false;
            for (const o of danhSachHienTai) {
                const nr = o.r + 1;
                const nc = o.c;

                // Chỉ rơi nếu ô dưới còn trong bảng và đang trống
                if (nr < SO_HANG && luoi[nr][nc] === 0) {
                    luoi[nr][nc] = luoi[o.r][nc];
                    luoi[o.r][nc] = 0;

                    if (typeof luoiIcon !== 'undefined' && luoiIcon) {
                        luoiIcon[nr][nc] = luoiIcon[o.r][nc];
                        luoiIcon[o.r][nc] = null;
                    }

                    if (typeof luoiDoVat !== 'undefined' && luoiDoVat) {
                        luoiDoVat[nr][nc] = 0;
                        luoiDoVat[o.r][nc] = 0;
                    }

                    // Nếu ô vừa rơi chạm đáy hoặc chạm vật bên dưới -> tạo hiệu ứng bụi hạ cánh
                    if (nr + 1 >= SO_HANG || luoi[nr + 1][nc] !== 0) {
                        taoBuiHaCanhLevel3((nc + 0.5) * KICH_THUOC_O, (nr + 1) * KICH_THUOC_O);
                    }

                    coRoi = true;
                }
            }

            ve();

            if (coRoi) {
                // Tiếp tục nhịp rơi tiếp theo với tốc độ 50ms tạo cảm giác rơi vật lý mượt mà
                setTimeout(buocRoi, 50);
            } else {
                ketThucRoiTrongLucLevel3(callback);
            }
        }

        setTimeout(buocRoi, doTreBanDau);
    }

    // Xử lý dọn hàng, bom combo và kiểm tra tiếp cascade sau khi gạch hạ cánh
    function ketThucRoiTrongLucLevel3(callback) {
        // Kiểm tra xóa các hàng đã lấp đầy sau khi gạch rơi xuống
        xoaHangDay();

        // Kiểm tra nếu các quả bom rơi sát nhau tạo cụm 3 bom thì kích nổ
        if (typeof kiemTraVaKichNoCumBomLevel3 === 'function') {
            kiemTraVaKichNoCumBomLevel3();
        }

        // Nếu việc xóa hàng hoặc nổ bom lại tạo ra khối lơ lửng mới -> tiếp tục cascade rơi tiếp
        const oConLai = timCacOPlayerKhongDiemTua();
        if (oConLai.length > 0) {
            setTimeout(() => {
                thucHienRoiTrongLucLevel3(callback);
            }, 100);
            return;
        }

        dangRoiTrongLucLevel3 = false;
        ve();
        if (typeof callback === 'function') {
            callback();
        }
    }

    // Tạo hạt bụi khi khối gạch chạm đất hạ cánh
    function taoBuiHaCanhLevel3(cx, cy) {
        for (let i = 0; i < 4; i++) {
            dsBuiHaCanhLevel3.push({
                x: cx + (Math.random() - 0.5) * (KICH_THUOC_O * 0.8),
                y: cy - 2,
                vx: (Math.random() - 0.5) * 1.6,
                vy: -0.6 - Math.random() * 1.2,
                alpha: 1.0,
                banKinh: 1.5 + Math.random() * 1.5,
                mau: Math.random() > 0.4 ? '#ffffff' : '#ffd54f'
            });
        }
    }

    // Vẽ hiệu ứng vụ nổ bom & bụi hạ cánh trọng lực trên canvas bảng chơi
    function veHieuUngNoLevel3(ctx) {
        if (!ctx || (dsHieuUngNo.length === 0 && dsBuiHaCanhLevel3.length === 0)) return;
        const bayGio = performance.now();

        // 1. Vẽ bụi hạ cánh của gạch rơi trọng lực
        if (dsBuiHaCanhLevel3.length > 0) {
            ctx.save();
            dsBuiHaCanhLevel3 = dsBuiHaCanhLevel3.filter(b => {
                b.x += b.vx;
                b.y += b.vy;
                b.alpha -= 0.05;
                if (b.alpha <= 0) return false;

                ctx.fillStyle = b.mau;
                ctx.globalAlpha = Math.max(0, b.alpha);
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.banKinh, 0, Math.PI * 2);
                ctx.fill();
                return true;
            });
            ctx.restore();
        }

        // 2. Vẽ hiệu ứng bom nổ
        dsHieuUngNo = dsHieuUngNo.filter(hieuUng => {
            const daTroiQua = bayGio - hieuUng.batDau;
            if (daTroiQua >= hieuUng.thoiLuong) return false;

            const tienTrinh = daTroiQua / hieuUng.thoiLuong; // 0.0 -> 1.0
            const alpha = 1 - tienTrinh;

            ctx.save();

            // Vòng sóng xung kích (Shockwave ring)
            const banKinhHienTai = hieuUng.banKinhToiDa * Math.sin(tienTrinh * Math.PI / 2);
            ctx.beginPath();
            ctx.arc(hieuUng.cx, hieuUng.cy, banKinhHienTai, 0, Math.PI * 2);
            ctx.strokeStyle = hieuUng.laSieuNo
                ? `rgba(255, 100, 0, ${alpha * 0.9})`
                : `rgba(255, 152, 0, ${alpha * 0.8})`;
            ctx.lineWidth = (hieuUng.laSieuNo ? 4.5 : 3) * (1 - tienTrinh) + 1;
            ctx.stroke();

            // Vòng sóng phụ cho Siêu Nổ
            if (hieuUng.laSieuNo) {
                ctx.beginPath();
                ctx.arc(hieuUng.cx, hieuUng.cy, banKinhHienTai * 0.7, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 235, 59, ${alpha * 0.8})`;
                ctx.lineWidth = 2.5 * (1 - tienTrinh) + 1;
                ctx.stroke();
            }

            // Chớp sáng rực ở tâm
            if (tienTrinh < 0.45) {
                const flashAlpha = (0.45 - tienTrinh) / 0.45;
                ctx.fillStyle = hieuUng.laSieuNo
                    ? `rgba(255, 255, 220, ${flashAlpha * 0.85})`
                    : `rgba(255, 255, 200, ${flashAlpha * 0.7})`;
                ctx.beginPath();
                ctx.arc(hieuUng.cx, hieuUng.cy, banKinhHienTai * 0.65, 0, Math.PI * 2);
                ctx.fill();
            }

            // Tia lửa bắn ra
            for (const hat of hieuUng.hat) {
                const hx = hat.x + hat.vx * (daTroiQua / 16);
                const hy = hat.y + hat.vy * (daTroiQua / 16);
                ctx.fillStyle = hat.mau;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(hx, hy, hat.kichThuoc * (1 - tienTrinh * 0.5), 0, Math.PI * 2);
                ctx.fill();
            }

            // Text nổi vụ nổ
            const textY = hieuUng.cy - 12 - tienTrinh * 25;
            ctx.font = hieuUng.laSieuNo ? 'bold 15px sans-serif' : 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = hieuUng.laSieuNo ? `rgba(255, 215, 0, ${alpha})` : `rgba(255, 235, 59, ${alpha})`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 5;

            let textNo = hieuUng.laSieuNo
                ? (hieuUng.soGach > 0 ? `💥💥 SIÊU NỔ 4x4! (-${hieuUng.soGach} GẠCH)` : '💥💥 SIÊU NỔ 4x4!')
                : (hieuUng.soGach > 0 ? `💥 -${hieuUng.soGach} GẠCH!` : '💥 BÙM!');

            ctx.fillText(textNo, hieuUng.cx, textY);

            ctx.restore();
            return true;
        });
    }

    // Cập nhật tiến độ phá chướng ngại vật trên giao diện
    function capNhatTienDoChuongNgaiVat() {
        if (capDo !== 3) return;
        if (missionGoalVal) {
            missionGoalVal.textContent = `${soVatDaPha} / ${tongSoVatCanPha}`;
        }
        const phanTram = tongSoVatCanPha > 0
            ? Math.min(100, Math.floor((soVatDaPha / tongSoVatCanPha) * 100))
            : 0;
        if (leftProgressFill) leftProgressFill.style.width = phanTram + '%';
    }

    // Kiểm tra điều kiện chiến thắng Màn 3
    function kiemTraChienThangLevel3() {
        if (capDo !== 3 || daChienThangManNay) return;
        if (soVatDaPha >= tongSoVatCanPha && tongSoVatCanPha > 0) {
            daChienThangManNay = true;
            setTimeout(() => {
                xuLyChienThangLevel(3);
            }, 350);
        }
    }

    function thietLapLevel3() {
        mucTieuDiem = 0; // Màn 3 không dựa vào điểm số, dựa vào phá chướng ngại vật
        tocDoRoi    = TOC_DO_LV3;
        if (typeof datLaiTrangThaiLevel6 === 'function') datLaiTrangThaiLevel6();

        if (sectionIconList)  sectionIconList.classList.add('hidden');
        if (sectionMission)   sectionMission.classList.remove('hidden');
        if (boxDaoPhim)       boxDaoPhim.classList.add('hidden');
        if (boxChuongNgaiVat) boxChuongNgaiVat.classList.remove('hidden');
        if (boxSinhTon)       boxSinhTon.classList.add('hidden');
        if (boxAnKhoi)        boxAnKhoi.classList.add('hidden');

        if (missionTitle)     missionTitle.textContent     = 'MÀN 3: THỬ THÁCH CHƯỚNG NGẠI VẬT';
        if (missionDesc)      missionDesc.textContent      = 'Phá hủy gạch chướng ngại vật. Gom từ 3 quả Bom 💣 để Siêu Nổ 4x4. Khối gạch lơ lửng sẽ tự rơi lấp khoảng trống!';
        if (missionGoalLabel) missionGoalLabel.textContent = 'Gạch đã phá';

        capNhatTienDoChuongNgaiVat();
        capNhatHelpTextChung(false);
    }

    // CƠ CHẾ LEVEL 4: THỬ THÁCH THU THẬP
    // Mục tiêu: Thu thập đủ 10 loại icon khác nhau
    // Tốc độ rơi: 500ms
    // Cơ chế riêng: Sinh icon trên khối gạch, thu thập icon khi phá hàng
    const MUC_TIEU_LV4 = 10;
    const TOC_DO_LV4   = 500;

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

    let luoiIcon = Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(null));
    let boDemIcon = {};
    let boSuuTapDaCo = new Set();

    function taoLuoiIcon() {
        return Array.from({ length: SO_HANG }, () => Array(SO_COT).fill(null));
    }

    function khoiTaoTrangThaiLevel4() {
        luoiIcon = taoLuoiIcon();
        boDemIcon = {};
        boSuuTapDaCo.clear();
    }

    // Cơ chế random icon ~42%
    function ganIconLevel4(khoi) {
        const coIcon = Math.random() < 0.42;
        if (!coIcon) return;

        const hinh = khoi.hinh;
        const N = hinh.length;
        const oHopLe = [];

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                if (hinh[r][c] !== 0) oHopLe.push({ r, c });
            }
        }

        if (oHopLe.length > 0) {
            const oChon = oHopLe[Math.floor(Math.random() * oHopLe.length)];
            const item = DANH_SACH_10_ICON[Math.floor(Math.random() * DANH_SACH_10_ICON.length)];
            khoi.iconGrid[oChon.r][oChon.c] = item.icon;
        }
    }

    // Lấy mô tả icon trong khối xem trước
    function layMoTaIconLevel4(khoi) {
        if (!khoi || !khoi.iconGrid) return null;
        for (let r = 0; r < khoi.iconGrid.length; r++) {
            for (let c = 0; c < khoi.iconGrid[r].length; c++) {
                if (khoi.iconGrid[r][c]) {
                    const iconChar = khoi.iconGrid[r][c];
                    const item = DANH_SACH_10_ICON.find(q => q.icon === iconChar);
                    return `${iconChar} ${item ? item.ten : ''}`;
                }
            }
        }
        return null;
    }

    // Vẽ ô chứa Icon
    function veHuyHieuIconLevel4(ctx, px, py, kichThuoc, icon) {
        const margin = Math.max(2, Math.round(kichThuoc * 0.1));
        const bx = px + margin;
        const by = py + margin;
        const bw = kichThuoc - margin * 2;
        const bh = kichThuoc - margin * 2;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.lineWidth   = 1;
        ctx.strokeStyle = '#495057';
        ctx.strokeRect(bx, by, bw, bh);

        const fontSize   = Math.round(bw * 0.65);
        ctx.font         = `${fontSize}px sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, bx + bw / 2, by + bh / 2 + 1);
        ctx.restore();
    }

    // Cập nhật 10 hàng icon trong Cột Trái
    function capNhatGiaoDien10Icon() {
        const soLoai = boSuuTapDaCo.size;
        if (iconProgressBadge) iconProgressBadge.textContent = `${soLoai}/10`;

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

    // Xử lý thu thập icon khi xóa hàng ở lv4
    function xuLyThuThap10IconLevel4(icons) {
        for (const icon of icons) {
            const item = DANH_SACH_10_ICON.find(q => q.icon === icon);
            if (!item) continue;

            const daCoTruoc = boSuuTapDaCo.has(item.id);
            boDemIcon[item.id] = (boDemIcon[item.id] || 0) + 1;

            if (!daCoTruoc) {
                boSuuTapDaCo.add(item.id);
                capNhatGiaoDien10Icon();

                if (boSuuTapDaCo.size >= 10 && !daChienThangManNay) {
                    daChienThangManNay = true;
                    setTimeout(() => {
                        xuLyChienThangLevel4Quest();
                    }, 350);
                    break;
                }
            } else {
                congDiem(200);
                capNhatGiaoDien10Icon();
            }
        }
    }

    function xuLyChienThangLevel4Quest() {
        xuLyChienThangLevel(4);
    }

    function thietLapLevel4() {
        mucTieuDiem = MUC_TIEU_LV4;
        tocDoRoi    = TOC_DO_LV4;
        if (typeof datLaiTrangThaiLevel6 === 'function') datLaiTrangThaiLevel6();

        if (sectionIconList)  sectionIconList.classList.remove('hidden');
        if (sectionMission)   sectionMission.classList.add('hidden');
        if (boxDaoPhim)       boxDaoPhim.classList.add('hidden');
        if (boxChuongNgaiVat) boxChuongNgaiVat.classList.add('hidden');
        if (boxSinhTon)       boxSinhTon.classList.add('hidden');
        if (boxAnKhoi)        boxAnKhoi.classList.add('hidden');

        capNhatGiaoDien10Icon();
        capNhatHelpTextChung(false);
    }

    // CƠ CHẾ LEVEL 5: THỬ THÁCH SINH TỒN
    // Mục tiêu: Sống sót trong 2p
    // Tốc độ rơi: 140ms
    // Cơ chế riêng: Tốc độ rơi siêu nhanh, sống sót trong 2p
    const THOI_GIAN_SINH_TON_LV5 = 120; // 120 giây
    const TOC_DO_LV5             = 140; // td siêu nhanh

    // Cập nhật tiến độ sống sót cho lv5
    function capNhatTienDoSinhTon() {
        if (capDo !== 5) return;
        const tgHienTai = dinhDangThoiGian(giayDaChoi);
        if (missionGoalVal) missionGoalVal.textContent = `${tgHienTai} / 02:00`;
        const phanTram = Math.min(100, Math.floor((giayDaChoi / THOI_GIAN_SINH_TON_LV5) * 100));
        if (leftProgressFill) leftProgressFill.style.width = phanTram + '%';
    }

    function thietLapLevel5() {
        mucTieuDiem = 0; // Level 5 tính tiến độ theo thời gian sống sót
        tocDoRoi    = TOC_DO_LV5;
        if (typeof datLaiTrangThaiLevel6 === 'function') datLaiTrangThaiLevel6();

        if (sectionIconList)  sectionIconList.classList.add('hidden');
        if (sectionMission)   sectionMission.classList.remove('hidden');
        if (boxDaoPhim)       boxDaoPhim.classList.add('hidden');
        if (boxChuongNgaiVat) boxChuongNgaiVat.classList.add('hidden');
        if (boxSinhTon)       boxSinhTon.classList.remove('hidden');
        if (boxAnKhoi)        boxAnKhoi.classList.add('hidden');

        if (missionTitle)     missionTitle.textContent     = 'MÀN 5: THỬ THÁCH SINH TỒN';
        if (missionDesc)      missionDesc.textContent      = 'Tốc độ rơi siêu nhanh! Giữ bảng không bị đầy và sống sót trong 2:00 phút để chiến thắng.';
        if (missionGoalLabel) missionGoalLabel.textContent = 'Thời gian sống sót';

        capNhatTienDoSinhTon();
        capNhatHelpTextChung(false);
    }

    // CƠ CHẾ LEVEL 6: THỬ THÁCH GHI NHỚ
    // Mục tiêu: 10000d
    // Tốc độ rơi: 500ms
    // Cơ chế riêng: Gạch bên dưới bị ẩn, thả rơi tức thì hiện trong 0.75s
    const MUC_TIEU_LV6 = 10000;
    const TOC_DO_LV6   = 500;

    let dangHienGachAnLevel6    = false;
    let idTimeoutHienGachLevel6 = null;

    // Kiểm tra xem gạch cố định ở bảng chơi có được hiển thị không
    function coHienGachCoDinhLevel6() {
        if (capDo !== 6) return true;
        return dangHienGachAnLevel6;
    }

    // Kích hoạt hiển thị toàn bộ khối trong 0.75 giây khi thả rơi tức thì
    function kichHoatHienGachLevel6() {
        if (capDo !== 6) return;
        dangHienGachAnLevel6 = true;
        if (idTimeoutHienGachLevel6) {
            clearTimeout(idTimeoutHienGachLevel6);
        }
        idTimeoutHienGachLevel6 = setTimeout(() => {
            dangHienGachAnLevel6 = false;
            ve();
        }, 750);
        ve();
    }

    // Đặt lại trạng thái ẩn gạch của lv6
    function datLaiTrangThaiLevel6() {
        dangHienGachAnLevel6 = false;
        if (idTimeoutHienGachLevel6) {
            clearTimeout(idTimeoutHienGachLevel6);
            idTimeoutHienGachLevel6 = null;
        }
    }

    function capNhatHelpTextLevel6() {
        if (!huongDanPhim) return;
        huongDanPhim.innerHTML = `
            <div class="help-item"><span>← →</span> : Sang trái / phải</div>
            <div class="help-item"><span>↑</span> : Xoay khối gạch</div>
            <div class="help-item"><span>↓</span> : Rơi nhanh (Soft drop)</div>
            <div class="help-item help-inverted-hint"><span>Shift / Space</span> : Thả rơi liền (Hiện gạch 0.75s)</div>
            <div class="help-item"><span>P</span> : Tạm dừng</div>
        `;
    }

    function thietLapLevel6() {
        mucTieuDiem = MUC_TIEU_LV6;
        tocDoRoi    = TOC_DO_LV6;
        datLaiTrangThaiLevel6();

        if (sectionIconList)  sectionIconList.classList.add('hidden');
        if (sectionMission)   sectionMission.classList.remove('hidden');
        if (boxDaoPhim)       boxDaoPhim.classList.add('hidden');
        if (boxChuongNgaiVat) boxChuongNgaiVat.classList.add('hidden');
        if (boxSinhTon)       boxSinhTon.classList.add('hidden');
        if (boxAnKhoi)        boxAnKhoi.classList.remove('hidden');

        if (missionTitle)     missionTitle.textContent     = 'MÀN 6: THỬ THÁCH GHI NHỚ';
        if (missionDesc)      missionDesc.textContent      = 'Gạch bên dưới bị ẩn. Thả rơi tức thì (Space/Shift) để hiện gạch trong 0.75 giây. Đạt 10000 điểm để qua màn.';
        if (missionGoalLabel) missionGoalLabel.textContent = 'Điểm mục tiêu';

        capNhatHelpTextLevel6();
    }

    // CƠ CHẾ LEVEL 7: THỬ THÁCH VỚI BOSS
    // Mục tiêu: Trừ HP Boss về 0
    // Cơ chế riêng: Xóa hàng gây sát thương, Boss phản công dâng hàng rác
    const HP_TOI_DA_BOSS        = 100;
    const THOI_GIAN_BOSS_TOI_DA = 180; //180s

    let hpBossHienTai           = 100;
    let giaiDoanBoss            = 1;
    let giayDemNguocPhanCong    = 20;
    let thoiGianHoiChieuGiaiDoan = 20;

    let coKhienBoss             = false;
    let thoiGianConKhienBoss    = 0;
    let coTangTocBoss           = false;
    let thoiGianConTangToc      = 0;

    let dsHieuUngTanCongBoss    = [];
    let thongBaoBannerBoss      = null;

    // Tốc độ rơi theo từng giai đoạn và chiêu thức của Boss
    function layTocDoRoiLevel7() {
        if (coTangTocBoss) return 140; // Chiêu tăng tốc của Boss
        if (giaiDoanBoss === 1) return 450; // Giai đoạn 1: Thăm dò
        if (giaiDoanBoss === 2) return 300; // Giai đoạn 2: Cuồng nộ
        return 190; // Giai đoạn 3: Tuyệt vọng (siêu nhanh)
    }

    // Khởi tạo trạng thái ban đầu của Boss
    function khoiTaoLevel7Boss() {
        hpBossHienTai           = 100;
        giaiDoanBoss            = 1;
        thoiGianHoiChieuGiaiDoan = 20;
        giayDemNguocPhanCong    = 20;

        coKhienBoss             = false;
        thoiGianConKhienBoss    = 0;
        coTangTocBoss           = false;
        thoiGianConTangToc      = 0;

        dsHieuUngTanCongBoss    = [];
        thongBaoBannerBoss      = null;

        capNhatGiaoDienLevel7();
    }

    // Kích hoạt Khiên Hắc Ám (-50%dmg)
    function kichHoatKhienBoss(thoiGianGiay = 6) {
        coKhienBoss = true;
        thoiGianConKhienBoss = thoiGianGiay;
        hienThiBannerBoss('🛡️ BOSS BẬT KHIÊN HẮC ÁM (-50% DMG)!', '#0284c7');
        capNhatGiaoDienLevel7();
    }

    // Kích hoạt chiêu Tăng Tốc Độ Rơi (4s)
    function kichHoatTangTocBoss(thoiGianGiay = 4) {
        coTangTocBoss = true;
        thoiGianConTangToc = thoiGianGiay;
        tocDoRoi = layTocDoRoiLevel7();
        hienThiBannerBoss('⚡ BOSS CUỒNG NỘ: TĂNG TỐC ĐỘ RƠI!', '#eab308');
        capNhatGiaoDienLevel7();
    }

    // Hiển thị banner thông báo nổi giữa màn hình
    function hienThiBannerBoss(thongBao, mau = '#ffd700', thoiLuong = 1200) {
        thongBaoBannerBoss = {
            text: thongBao,
            mau,
            batDau: performance.now(),
            thoiLuong
        };
    }

    // Tấn công Boss khi người chơi xóa hàng thành công
    function tanCongBossLevel7(soHangXoa) {
        if (capDo !== 7 || soHangXoa <= 0 || hpBossHienTai <= 0) return;

        // Bảng sát thương chuẩn theo yêu cầu: 1 hàng = 5, 2 hàng = 12, 3 hàng = 20, 4 hàng = 30
        const bangSatThuong = [0, 5, 12, 20, 30];
        const satThuongGoc  = bangSatThuong[soHangXoa] || (soHangXoa * 8);

        let satThuongThucTe = satThuongGoc;
        if (coKhienBoss) {
            satThuongThucTe = Math.max(1, Math.round(satThuongGoc * 0.5));
        }

        hpBossHienTai = Math.max(0, hpBossHienTai - satThuongThucTe);

        // Hiệu ứng phản hồi đòn đánh trên Avatar Boss
        if (bossCubeAvatar) {
            bossCubeAvatar.classList.add('hit-react');
            setTimeout(() => {
                if (bossCubeAvatar) bossCubeAvatar.classList.remove('hit-react');
            }, 250);
        }

        // Rung bảng chơi
        rungBangChoi(soHangXoa === 4 ? 220 : 120);

        // Tạo số sát thương nổi (Floating Damage Text)
        const laCrit = (soHangXoa === 4);
        let textDmg = laCrit
            ? `💥 -${satThuongThucTe} CHÍ MẠNG!!`
            : (coKhienBoss ? `🛡️ -${satThuongThucTe} (CHẮN 50%)` : `💥 -${satThuongThucTe} HP`);

        dsHieuUngTanCongBoss.push({
            text: textDmg,
            x: canvasBang ? canvasBang.width / 2 : 150,
            y: canvasBang ? canvasBang.height / 2 : 300,
            batDau: performance.now(),
            thoiLuong: laCrit ? 1100 : 850,
            laCrit,
            mau: laCrit ? '#ffd700' : (coKhienBoss ? '#38bdf8' : '#fb7185')
        });

        // Kiểm tra chuyển giai đoạn của Boss
        if (hpBossHienTai <= 70 && hpBossHienTai > 30 && giaiDoanBoss === 1) {
            giaiDoanBoss = 2;
            thoiGianHoiChieuGiaiDoan = 13;
            giayDemNguocPhanCong = Math.min(giayDemNguocPhanCong, 13);
            tocDoRoi = layTocDoRoiLevel7();
            kichHoatKhienBoss(6);
            hienThiBannerBoss('💥 GIAI ĐOẠN 2: BOSS CUỒNG NỘ (TỐC ĐỘ TĂNG)!', '#f97316', 1500);
            rungBangChoi(320);
        } else if (hpBossHienTai <= 30 && hpBossHienTai > 0 && giaiDoanBoss <= 2) {
            giaiDoanBoss = 3;
            thoiGianHoiChieuGiaiDoan = 7;
            giayDemNguocPhanCong = Math.min(giayDemNguocPhanCong, 7);
            tocDoRoi = layTocDoRoiLevel7();
            kichHoatTangTocBoss(4);
            hienThiBannerBoss('☠️ GIAI ĐOẠN 3: BOSS TUYỆT VỌNG - CUỒNG BẠO!', '#ef4444', 1600);
            rungBangChoi(450);
        }

        capNhatGiaoDienLevel7();

        // Kiểm tra hạ gục Boss
        if (hpBossHienTai <= 0) {
            hpBossHienTai = 0;
            daChienThangManNay = true;
            hienThiBannerBoss('👑 BOSS ĐÃ BỊ TIÊU DIỆT!', '#22c55e', 2000);
            rungBangChoi(500);
            setTimeout(() => {
                xuLyChienThangLevel(7);
            }, 600);
        }
    }

    // Boss phản công: Dâng thêm 1 hàng khối rác từ đáy bảng
    function themHangRacBoss() {
        if (capDo !== 7 || !dangChoi || ketThuc) return;

        // Nếu hàng trên cùng (hàng 0) đã có gạch -> dâng lên sẽ tràn đỉnh -> Game Over!
        if (luoi[0].some(o => o !== 0)) {
            kichHoatGameOver();
            return;
        }

        // Đẩy toàn bộ các hàng lên 1 nấc
        luoi.shift();
        if (typeof luoiIcon !== 'undefined' && luoiIcon) {
            luoiIcon.shift();
        }
        if (typeof luoiDoVat !== 'undefined' && luoiDoVat) {
            luoiDoVat.shift();
        }

        // Tạo 1 hàng rác ở đáy (hàng 19) với 1 đến 2 lỗ trống ngẫu nhiên
        const hangRac      = Array(SO_COT).fill(8);
        const hangRacDoVat = Array(SO_COT).fill(1);
        const hangRacIcon  = Array(SO_COT).fill(null);

        const soLoTrong = 1 + (Math.random() < 0.4 ? 1 : 0);
        const cacCotTrong = new Set();
        while (cacCotTrong.size < soLoTrong) {
            cacCotTrong.add(Math.floor(Math.random() * SO_COT));
        }

        for (const c of cacCotTrong) {
            hangRac[c]      = 0;
            hangRacDoVat[c] = 0;
        }

        luoi.push(hangRac);
        if (typeof luoiIcon !== 'undefined' && luoiIcon) {
            luoiIcon.push(hangRacIcon);
        }
        if (typeof luoiDoVat !== 'undefined' && luoiDoVat) {
            luoiDoVat.push(hangRacDoVat);
        }

        // Nếu khối đang rơi bị va chạm do hàng đẩy lên -> dời khối lên 1 ô hoặc khóa lại
        if (khoiHienTai && vaChạm(khoiHienTai)) {
            if (khoiHienTai.y > 0 && !vaChạm(khoiHienTai, 0, -1)) {
                khoiHienTai.y--;
            } else {
                khoaKhoi();
            }
        }

        rungBangChoi(180);
        hienThiBannerBoss('⚠️ BOSS PHẢN CÔNG: HÀNG RÁC DÂNG LÊN!', '#ef4444', 900);
        ve();
    }

    // Cập nhật nhịp đếm giờ & hồi chiêu Boss
    function capNhatDongHoLevel7() {
        if (capDo !== 7 || !dangChoi || dangDung || ketThuc) return;

        // 1. Đếm ngược phản công dâng hàng rác
        giayDemNguocPhanCong--;
        if (giayDemNguocPhanCong <= 0) {
            themHangRacBoss();
            giayDemNguocPhanCong = thoiGianHoiChieuGiaiDoan;
        }

        // 2. Đếm ngược hiệu lực kỹ năng Boss
        if (thoiGianConKhienBoss > 0) {
            thoiGianConKhienBoss--;
            if (thoiGianConKhienBoss <= 0) coKhienBoss = false;
        }

        if (thoiGianConTangToc > 0) {
            thoiGianConTangToc--;
            if (thoiGianConTangToc <= 0) {
                coTangTocBoss = false;
                tocDoRoi = layTocDoRoiLevel7();
            }
        }

        // 3. Boss tự động dùng kỹ năng ngẫu nhiên theo từng giai đoạn
        if (giaiDoanBoss === 2 && giayDaChoi > 0 && giayDaChoi % 22 === 0) {
            kichHoatKhienBoss(6);
        } else if (giaiDoanBoss === 3 && giayDaChoi > 0 && giayDaChoi % 16 === 0) {
            if (Math.random() < 0.5) {
                kichHoatTangTocBoss(4);
            } else {
                kichHoatKhienBoss(6);
            }
        }

        // 4. Giới hạn thời gian 3:00 phút (180s)
        const giayConLai = Math.max(0, THOI_GIAN_BOSS_TOI_DA - giayDaChoi);
        if (bossTimeRemaining) {
            bossTimeRemaining.textContent = dinhDangThoiGian(giayConLai);
            if (giayConLai <= 30) {
                bossTimeRemaining.style.color = '#ef4444';
            } else {
                bossTimeRemaining.style.color = '#ffffff';
            }
        }

        if (giayConLai <= 0 && hpBossHienTai > 0 && !daChienThangManNay) {
            kichHoatGameOver();
            return;
        }

        capNhatGiaoDienLevel7();
    }

    // Cập nhật giao diện thanh máu, đồng hồ và chiêu thức Boss
    function capNhatGiaoDienLevel7() {
        if (capDo !== 7) return;

        // 1. Cập nhật Phase Tag & Avatar
        if (bossPhaseTag) {
            bossPhaseTag.className = `boss-phase-tag phase-${giaiDoanBoss}`;
            if (giaiDoanBoss === 1) bossPhaseTag.textContent = 'GĐ 1: THĂM DÒ';
            else if (giaiDoanBoss === 2) bossPhaseTag.textContent = 'GĐ 2: CUỒNG NỘ 💥';
            else bossPhaseTag.textContent = 'GĐ 3: TUYỆT VỌNG ☠️';
        }

        if (bossEyesIcon) {
            if (giaiDoanBoss === 1) bossEyesIcon.textContent = '😈';
            else if (giaiDoanBoss === 2) bossEyesIcon.textContent = '🔥';
            else bossEyesIcon.textContent = '💀';
        }

        // 2. Cập nhật Thanh máu
        if (bossHpNumbers) {
            bossHpNumbers.textContent = `${hpBossHienTai} / ${HP_TOI_DA_BOSS}`;
        }

        const phanTramHp = Math.max(0, Math.min(100, Math.round((hpBossHienTai / HP_TOI_DA_BOSS) * 100)));
        if (bossHpFill) {
            bossHpFill.style.width = phanTramHp + '%';
            bossHpFill.className = `boss-hp-fill phase-${giaiDoanBoss}`;
        }
        if (bossHpDamageBar) {
            bossHpDamageBar.style.width = phanTramHp + '%';
        }

        // 3. Cập nhật đếm ngược phản công
        if (bossCounterTimer) {
            bossCounterTimer.textContent = `${giayDemNguocPhanCong}s`;
            if (giayDemNguocPhanCong <= 2) {
                bossCounterTimer.style.color = '#ef4444';
            } else {
                bossCounterTimer.style.color = '#38bdf8';
            }
        }

        if (bossCounterFill) {
            const phanTramHoiChieu = Math.max(0, Math.min(100, Math.round((giayDemNguocPhanCong / thoiGianHoiChieuGiaiDoan) * 100)));
            bossCounterFill.style.width = phanTramHoiChieu + '%';
            if (giayDemNguocPhanCong <= 2) {
                bossCounterFill.classList.add('warning');
            } else {
                bossCounterFill.classList.remove('warning');
            }
        }

        // 4. Cập nhật badges chiêu thức
        if (badgeBossShield) {
            if (coKhienBoss && thoiGianConKhienBoss > 0) {
                badgeBossShield.classList.remove('hidden');
                if (shieldTimer) shieldTimer.textContent = `${thoiGianConKhienBoss}s`;
            } else {
                badgeBossShield.classList.add('hidden');
            }
        }

        if (badgeBossLock) {
            badgeBossLock.classList.add('hidden');
        }

        if (badgeBossSpeed) {
            if (coTangTocBoss && thoiGianConTangToc > 0) {
                badgeBossSpeed.classList.remove('hidden');
            } else {
                badgeBossSpeed.classList.add('hidden');
            }
        }
    }

    // Vẽ hiệu ứng nổi, số sát thương và cảnh báo phản công trên canvas bảng chơi
    function veHieuUngLevel7(ctx) {
        if (!ctx || capDo !== 7) return;
        const bayGio = performance.now();

        // 1. Cảnh báo vạch đỏ khi sắp dâng hàng rác (còn <= 2 giây)
        if (giayDemNguocPhanCong <= 2 && dangChoi && !ketThuc && canvasBang) {
            ctx.save();
            const flash = (Math.sin(bayGio / 80) + 1) / 2;
            ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + flash * 0.25})`;
            ctx.fillRect(0, (SO_HANG - 1) * KICH_THUOC_O, canvasBang.width, KICH_THUOC_O);
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.6 + flash * 0.4})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(1, (SO_HANG - 1) * KICH_THUOC_O + 1, canvasBang.width - 2, KICH_THUOC_O - 2);
            ctx.restore();
        }

        // 2. Banner nổi thông báo giai đoạn / chiêu thức
        if (thongBaoBannerBoss && canvasBang) {
            const daTroiQua = bayGio - thongBaoBannerBoss.batDau;
            if (daTroiQua < thongBaoBannerBoss.thoiLuong) {
                const tienTrinh = daTroiQua / thongBaoBannerBoss.thoiLuong;
                const alpha = tienTrinh < 0.2 ? (tienTrinh / 0.2) : (tienTrinh > 0.8 ? (1 - (tienTrinh - 0.8) / 0.2) : 1);

                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
                ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
                ctx.fillRect(10, canvasBang.height / 2 - 30, canvasBang.width - 20, 48);
                ctx.strokeStyle = thongBaoBannerBoss.mau;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(10, canvasBang.height / 2 - 30, canvasBang.width - 20, 48);

                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = thongBaoBannerBoss.mau;
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 6;
                ctx.fillText(thongBaoBannerBoss.text, canvasBang.width / 2, canvasBang.height / 2 - 6);
                ctx.restore();
            } else {
                thongBaoBannerBoss = null;
            }
        }

        // 3. Số sát thương nổi (Floating Damage Text)
        dsHieuUngTanCongBoss = dsHieuUngTanCongBoss.filter(hieuUng => {
            const daTroiQua = bayGio - hieuUng.batDau;
            if (daTroiQua >= hieuUng.thoiLuong) return false;

            const tienTrinh = daTroiQua / hieuUng.thoiLuong;
            const alpha = 1 - tienTrinh;
            const offsetY = tienTrinh * 45;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = hieuUng.laCrit ? 'bold 16px sans-serif' : 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = hieuUng.mau;
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = hieuUng.laCrit ? 8 : 4;
            ctx.fillText(hieuUng.text, hieuUng.x, hieuUng.y - offsetY);
            ctx.restore();

            return true;
        });
    }

    // Thiết lập lv7
    function thietLapLevel7() {
        mucTieuDiem = 0; // Màn Boss đánh bại bằng cách trừ HP về 0
        tocDoRoi    = layTocDoRoiLevel7();
        khoiTaoLevel7Boss();

        if (sectionIconList)   sectionIconList.classList.add('hidden');
        if (sectionMission)    sectionMission.classList.add('hidden');
        if (sectionBoss)       sectionBoss.classList.remove('hidden');

        if (boxDaoPhim)        boxDaoPhim.classList.add('hidden');
        if (boxChuongNgaiVat)  boxChuongNgaiVat.classList.add('hidden');
        if (boxSinhTon)        boxSinhTon.classList.add('hidden');
        if (boxAnKhoi)         boxAnKhoi.classList.add('hidden');

        capNhatHelpTextChung(false);
    }


// HỆ THỐNG ĐIỀU PHỐI CHUNG, GIAO DIỆN & SỰ KIỆN

    // Điều phối di chuyển theo từng Level
    function diTrai() {
        if (capDo === 2) {
            diTraiLevel2(); // Màn 2: Cơ chế đảo phím
        } else {
            diTraiThucTe(); // Màn 1, 3 & 4: Di chuyển bình thường
        }
    }

    function diPhai() {
        if (capDo === 2) {
            diPhaiLevel2(); // Màn 2: Cơ chế đảo phím
        } else {
            diPhaiThucTe(); // Màn 1, 3 & 4: Di chuyển bình thường
        }
    }

    function capNhatHelpTextChung(laDaoPhim) {
        if (!huongDanPhim) return;
        if (laDaoPhim) {
            capNhatHelpTextLevel2();
        } else {
            huongDanPhim.innerHTML = `
                <div class="help-item"><span>← →</span> : Sang trái / phải</div>
                <div class="help-item"><span>↑</span> : Xoay khối gạch</div>
                <div class="help-item"><span>↓</span> : Rơi nhanh (Soft drop)</div>
                <div class="help-item"><span>Shift / Space</span> : Thả rơi liền</div>
                <div class="help-item"><span>P</span> : Tạm dừng</div>
            `;
        }
    }

    // Quản lý Cấp độ
    function datCapDo(cap, khoiDongLai = true) {
        capDo = cap;
        daChienThangManNay = false;
        if (typeof khoiTaoTrangThaiLevel4 === 'function') khoiTaoTrangThaiLevel4();
        if (typeof datLaiTrangThaiLevel6 === 'function') datLaiTrangThaiLevel6();
        if (cap !== 7 && sectionBoss) sectionBoss.classList.add('hidden');

        if (textLevelHienTai) {
            if (cap === 1) textLevelHienTai.textContent = 'Màn 1: Thử Thách Cổ Điển';
            else if (cap === 2) textLevelHienTai.textContent = 'Màn 2: Thử Thách Đảo Ngược ⇄';
            else if (cap === 3) textLevelHienTai.textContent = 'Màn 3: Thử Thách Chướng Ngại Vật 🧱';
            else if (cap === 4) textLevelHienTai.textContent = 'Màn 4: Thử Thách Thu Thập 🍓';
            else if (cap === 5) textLevelHienTai.textContent = 'Màn 5: Thử Thách Sinh Tồn ⚡';
            else if (cap === 6) textLevelHienTai.textContent = 'Màn 6: Thử Thách Ghi Nhớ 🧠';
            else if (cap === 7) textLevelHienTai.textContent = 'Màn 7: Thử Thách Với Boss';
        }

        if (cap === 1) {
            thietLapLevel1();
        } else if (cap === 2) {
            thietLapLevel2();
        } else if (cap === 3) {
            thietLapLevel3();
        } else if (cap === 4) {
            thietLapLevel4();
        } else if (cap === 5) {
            thietLapLevel5();
        } else if (cap === 6) {
            thietLapLevel6();
        } else if (cap === 7) {
            thietLapLevel7();
        }

        tocDoRoi = layTocDoRoi(cap);

        if (khoiDongLai) {
            batDauGame();
        } else {
            capNhatGiaoDien();
        }
    }

    // Quản lý Điểm số, Thời gian & Giao diện thông số
    function dinhDangThoiGian(soGiay) {
        const m = Math.floor(soGiay / 60).toString().padStart(2, '0');
        const s = (soGiay % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function capNhatDongHo() {
        if (dangChoi && !dangDung && !ketThuc) {
            giayDaChoi++;
            if (phanTuThoiGian) phanTuThoiGian.textContent = dinhDangThoiGian(giayDaChoi);

            // Kiểm tra chiến thắng Màn 5: Sinh tồn đủ 2 phút (120 giây)
            if (capDo === 5) {
                capNhatTienDoSinhTon();
                if (giayDaChoi >= THOI_GIAN_SINH_TON_LV5 && !daChienThangManNay) {
                    daChienThangManNay = true;
                    setTimeout(() => {
                        xuLyChienThangLevel(5);
                    }, 200);
                }
            }

            // Quản lý đếm giờ, hồi chiêu & kỹ năng Boss ở Màn 7
            if (capDo === 7 && typeof capNhatDongHoLevel7 === 'function') {
                capNhatDongHoLevel7();
            }
        }
    }

    function congDiem(soLuong) {
        diem += soLuong;
        capNhatGiaoDien();

        if (!daChienThangManNay) {
            if (capDo === 1 && diem >= 1000) {
                daChienThangManNay = true;
                xuLyChienThangLevel(1);
            } else if (capDo === 2 && diem >= 2000) {
                daChienThangManNay = true;
                xuLyChienThangLevel(2);
            } else if (capDo === 6 && diem >= 10000) {
                daChienThangManNay = true;
                xuLyChienThangLevel(6);
            }
            // Màn 3 & Màn 7: Chiến thắng bằng điều kiện riêng (phá gạch hoặc trừ hết HP Boss)
        }
    }

    function capNhatGiaoDien() {
        if (phanTuDiem) phanTuDiem.textContent = diem.toLocaleString();
        if (phanTuHang) phanTuHang.textContent = soHang;
        if (phanTuCap)  phanTuCap.textContent  = capDo;

        if (capDo === 1 || capDo === 2 || capDo === 6) {
            if (missionGoalVal) missionGoalVal.textContent = `${diem.toLocaleString()} / ${mucTieuDiem.toLocaleString()}`;
            const phanTram = Math.min(100, Math.floor((diem / mucTieuDiem) * 100));
            if (leftProgressFill) leftProgressFill.style.width = phanTram + '%';
        } else if (capDo === 3) {
            capNhatTienDoChuongNgaiVat();
        } else if (capDo === 5) {
            capNhatTienDoSinhTon();
        } else if (capDo === 7 && typeof capNhatGiaoDienLevel7 === 'function') {
            capNhatGiaoDienLevel7();
        }
    }

    // Xử lý Thắng cuộc, Game Over & Chuyển màn hình
    function xuLyChienThangLevel(levelVuaQua) {
        dangDung = true;
        cancelAnimationFrame(idFrame);

        if (modalDiemCT) modalDiemCT.textContent = diem.toLocaleString();
        if (modalHangCT) modalHangCT.textContent = soHang;

        if (modalTieuDe) modalTieuDe.textContent = `Chiến thắng Màn ${levelVuaQua}!`;

        if (levelVuaQua === 1) {
            if (modalMoTa) modalMoTa.innerHTML = 'Chúc mừng bạn đã hoàn thành mục tiêu 1000 điểm của Thử Thách Cổ Điển.';
            if (nutLevelTiep) nutLevelTiep.innerHTML = '<i class="bi bi-arrow-right-circle"></i> Lv tiếp theo (Màn 2)';
        } else if (levelVuaQua === 2) {
            if (modalMoTa) modalMoTa.innerHTML = 'Chúc mừng bạn đã hoàn thành mục tiêu 2000 điểm của Thử Thách Đảo Ngược.';
            if (nutLevelTiep) nutLevelTiep.innerHTML = '<i class="bi bi-arrow-right-circle"></i> Lv tiếp theo (Màn 3)';
        } else if (levelVuaQua === 3) {
            if (modalMoTa) modalMoTa.innerHTML = `Chúc mừng bạn đã phá hủy toàn bộ ${tongSoVatCanPha} gạch chướng ngại vật! 🧱💣💥`;
            if (nutLevelTiep) nutLevelTiep.innerHTML = '<i class="bi bi-arrow-right-circle"></i> Lv tiếp theo (Màn 4)';
        } else if (levelVuaQua === 4) {
            if (modalMoTa) modalMoTa.innerHTML = 'Chúc mừng bạn đã thu thập trọn bộ 10 loại icon! 🍓🍇⭐';
            if (nutLevelTiep) nutLevelTiep.innerHTML = '<i class="bi bi-arrow-right-circle"></i> Lv tiếp theo (Màn 5)';
        } else if (levelVuaQua === 5) {
            if (modalMoTa) modalMoTa.innerHTML = 'Xuất sắc! Bạn đã sống sót trọn vẹn 2:00 phút với tốc độ rơi siêu nhanh!';
            if (nutLevelTiep) nutLevelTiep.innerHTML = '<i class="bi bi-arrow-right-circle"></i> Lv tiếp theo (Màn 6)';
        } else if (levelVuaQua === 6) {
            if (modalMoTa) modalMoTa.innerHTML = 'Chúc mừng bạn đã hoàn thành mục tiêu 10000 điểm của Thử Thách Ghi Nhớ.';
            if (nutLevelTiep) nutLevelTiep.innerHTML = '<i class="bi bi-arrow-right-circle"></i> Lv tiếp theo (Màn 7)';
        } else if (levelVuaQua === 7) {
            if (modalMoTa) modalMoTa.innerHTML = 'Chúc mừng bạn đã hoàn thành Thử Thách Với Boss và hạ gục Boss thành công! 👑';
            if (nutLevelTiep) nutLevelTiep.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Chơi lại từ Màn 1';
        }

        if (nutTiepTuc) nutTiepTuc.innerHTML = '<i class="bi bi-play-fill"></i> Chơi tiếp';
        if (nutChoiLaiTuDau) nutChoiLaiTuDau.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Chơi lại từ đầu';
        if (nutModalMenu) nutModalMenu.innerHTML = '<i class="bi bi-house"></i> Menu';

        if (modalChienThang) modalChienThang.classList.remove('hidden');
    }

    function chonTiepTuc() {
        if (modalChienThang) modalChienThang.classList.add('hidden');
        dangDung      = false;
        thoiGianTruoc = performance.now();
        idFrame       = requestAnimationFrame(vongLapGame);

        if (nutBatDau) nutBatDau.textContent = '⏸ Tạm dừng';

        if (capDo === 1 && missionDesc) {
            missionDesc.textContent = 'Đã hoàn thành 1000 điểm! Đang tiếp tục chơi tự do.';
        } else if (capDo === 2 && missionDesc) {
            missionDesc.textContent = 'Đã hoàn thành 2000 điểm! Đang tiếp tục chơi tự do.';
        } else if (capDo === 3 && missionDesc) {
            missionDesc.textContent = 'Đã phá hủy hết chướng ngại vật! Đang tiếp tục chơi tự do.';
        } else if (capDo === 4 && missionDesc) {
            missionDesc.textContent = 'Đã thu thập đủ 10 icon! Đang tiếp tục chơi tự do.';
        } else if (capDo === 5 && missionDesc) {
            missionDesc.textContent = 'Đã sống sót qua 2:00 phút! Đang tiếp tục thử thách giới hạn.';
        } else if (capDo === 6 && missionDesc) {
            missionDesc.textContent = 'Đã hoàn thành 10000 điểm! Đang tiếp tục chơi tự do.';
        } else if (capDo === 7 && missionDesc) {
            missionDesc.textContent = 'Đã hạ gục Boss! Đang tiếp tục chơi tự do.';
        }
    }

    function hienThiMenu() {
        dangChoi = false;
        dangDung = false;
        ketThuc  = true;
        daChienThangManNay = false;
        cancelAnimationFrame(idFrame);
        clearInterval(idIntervalTimer);

        if (typeof datLaiTrangThaiLevel6 === 'function') datLaiTrangThaiLevel6();

        if (modalChienThang) modalChienThang.classList.add('hidden');
        if (modalGameOver) modalGameOver.classList.add('hidden');
        if (thongBaoBang) thongBaoBang.classList.remove('visible');
        if (sectionBoss) sectionBoss.classList.add('hidden');

        if (menuChinh) menuChinh.classList.remove('hidden');
        if (khungGame) khungGame.classList.add('hidden');
    }

    function vaoManChoi(cap) {
        if (menuChinh) menuChinh.classList.add('hidden');
        if (khungGame) khungGame.classList.remove('hidden');

        datCapDo(cap, true);
    }

    function chonLevelTiep() {
        if (modalChienThang) modalChienThang.classList.add('hidden');

        if (capDo === 1) {
            vaoManChoi(2);
        } else if (capDo === 2) {
            vaoManChoi(3);
        } else if (capDo === 3) {
            vaoManChoi(4);
        } else if (capDo === 4) {
            vaoManChoi(5);
        } else if (capDo === 5) {
            vaoManChoi(6);
        } else if (capDo === 6) {
            vaoManChoi(7);
        } else {
            vaoManChoi(1);
        }
    }

    function kichHoatGameOver() {
        ketThuc   = true;
        dangChoi  = false;
        cancelAnimationFrame(idFrame);
        clearInterval(idIntervalTimer);

        if (goDiem) goDiem.textContent = diem.toLocaleString();
        if (goHang) goHang.textContent = soHang;

        // // hiển thị gạch lv6
        // if (capDo === 6 && typeof datLaiTrangThaiLevel6 === 'function') {
        //     dangHienGachAnLevel6 = true;
        //     ve();
        // }

        // if (goTieuDe) {
        //     goTieuDe.textContent = 'Game Over';
        //     d
        // }

        if (goMoTa) {
            if (capDo === 1) {
                goMoTa.textContent = `Chưa đạt mục tiêu 1000 điểm (${diem.toLocaleString()} / 1000) mà gạch đã chạm đỉnh bảng.`;
            } else if (capDo === 2) {
                goMoTa.textContent = `Chưa đạt mục tiêu 2000 điểm (${diem.toLocaleString()} / 2000) mà gạch đã chạm đỉnh bảng.`;
            } else if (capDo === 3) {
                goMoTa.textContent = `Chưa phá hết chướng ngại vật (${soVatDaPha} / ${tongSoVatCanPha}) mà gạch đã chạm đỉnh bảng.`;
            } else if (capDo === 4) {
                goMoTa.textContent = `Chưa thu thập đủ 10 icon (${boSuuTapDaCo.size} / 10) mà gạch đã chạm đỉnh bảng.`;
            } else if (capDo === 5) {
                goMoTa.textContent = `Chưa sống sót đủ 2 phút (đạt ${dinhDangThoiGian(giayDaChoi)} / 02:00) mà gạch đã chạm đỉnh bảng.`;
            } else if (capDo === 6) {
                goMoTa.textContent = `Chưa đạt mục tiêu 10000 điểm (${diem.toLocaleString()} / 10000) mà gạch đã chạm đỉnh bảng.`;
            } else if (capDo === 7) {
                goMoTa.textContent = `Chưa hạ gục được Boss (Boss còn ${hpBossHienTai} HP) mà gạch đã chạm đỉnh bảng.`;
            } else {
                goMoTa.textContent = 'Khối gạch đã chạm đỉnh bảng.';
            }
        }

        if (nutChoiLai) {
            nutChoiLai.className = 'btn-primary';
            nutChoiLai.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Chơi lại';
        }

        if (nutGameOverMenu) {
            nutGameOverMenu.innerHTML = '<i class="bi bi-house"></i> Menu';
        }

        if (modalGameOver) modalGameOver.classList.remove('hidden');
        if (nutBatDau) nutBatDau.textContent = '▶ Bắt đầu lại';
    }
    // Chọn màn từ Menu Chính
    if (cardLvl1) cardLvl1.addEventListener('click', () => vaoManChoi(1));
    if (cardLvl2) cardLvl2.addEventListener('click', () => vaoManChoi(2));
    if (cardLvl3) cardLvl3.addEventListener('click', () => vaoManChoi(3));
    if (cardLvl4) cardLvl4.addEventListener('click', () => vaoManChoi(4));
    if (cardLvl5) cardLvl5.addEventListener('click', () => vaoManChoi(5));
    if (cardLvl6) cardLvl6.addEventListener('click', () => vaoManChoi(6));
    if (cardLvl7) cardLvl7.addEventListener('click', () => vaoManChoi(7));

    // Nút 'Chơi ngay' trên từng thẻ Màn chơi
    document.querySelectorAll('.btn-play-level').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.level-select-card');
            if (card) {
                const lvl = parseInt(card.getAttribute('data-level'), 10) || 1;
                vaoManChoi(lvl);
            }
        });
    });

    // Nút Về Menu trên Top Bar và các Modal
    if (nutVeMenu)       nutVeMenu.addEventListener('click', hienThiMenu);
    if (nutModalMenu)    nutModalMenu.addEventListener('click', hienThiMenu);
    if (nutGameOverMenu) nutGameOverMenu.addEventListener('click', hienThiMenu);

    // Nút Bắt đầu / Tạm dừng
    if (nutBatDau) {
        nutBatDau.addEventListener('click', () => {
            if (!dangChoi || ketThuc) batDauGame();
            else togDung();
        });
    }

    // Nút trong Modal Chiến Thắng
    if (nutTiepTuc) nutTiepTuc.addEventListener('click', chonTiepTuc);
    if (nutLevelTiep) nutLevelTiep.addEventListener('click', chonLevelTiep);
    if (nutChoiLaiTuDau) {
        nutChoiLaiTuDau.addEventListener('click', () => {
            if (modalChienThang) modalChienThang.classList.add('hidden');
            datCapDo(capDo, true);
        });
    }

    // Nút trong Modal Game Over
    if (nutChoiLai) {
        nutChoiLai.addEventListener('click', () => {
            if (modalGameOver) modalGameOver.classList.add('hidden');
            datCapDo(capDo, true);
        });
    }

    // Sự kiện bàn phím điều khiển
    window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Shift'].includes(e.key) || e.key === 'Shift') {
            e.preventDefault();
        }

        if (e.key === 'p' || e.key === 'P') { togDung(); return; }

        if (!dangChoi || dangDung || ketThuc || dangRoiTrongLucLevel3) return;

        // Thả rơi ngay bằng cách nhấn shift or space
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

    hienThiMenu();

})();
