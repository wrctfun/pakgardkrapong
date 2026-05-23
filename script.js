// ==========================================
// 🔴 1. CONFIG
// ==========================================
const SUPABASE_URL    = "https://pmdhcytmvpctiavxmumn.supabase.co";
const SUPABASE_KEY    = "sb_publishable_IovbRnLmlgLdVCq-XATAWA_g6_V_ox0";
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1507435981505302659/p92kQ0qmAQhMDXq_q4D1lCPGwILP-iDG5NqHa7pVOJaeGckrEWyfafpZC_G87ygxwB6J";
const ADMIN_PASSWORD  = "676767";

const COLOR_NEW     = 0x22C55E;
const COLOR_APPROVE = 0x3B82F6;
const COLOR_REJECT  = 0xEF4444;
const COLOR_VOTE    = 0xF59E0B;

// ==========================================
// 🛡️ 2. SUPABASE CLIENT
// ==========================================
function getDB() {
    if (!window._kpkDB) {
        const lib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
        if (lib && typeof lib.createClient === 'function') {
            window._kpkDB = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
    }
    return window._kpkDB || null;
}

// ==========================================
// 🔔 3. DISCORD HELPERS
// ==========================================
async function sendDiscordNotification(payload) {
    try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) console.error("Discord error:", res.status, await res.text());
    } catch (err) { console.error("Discord send failed:", err); }
}

function getDeviceType() {
    const ua = navigator.userAgent;

    // --- Android: ดึงรุ่นจาก UA ---
    if (/android/i.test(ua)) {
        const modelMatch = ua.match(/Android[\s\d.]+;\s*([^)]+?)\s*(Build|;|\))/i);
        let model = modelMatch ? modelMatch[1].trim() : "Unknown";
        model = model.replace(/\s*(Build\/.*|wv)$/i, '').trim();

        const brands = [
            [/^SM-/i,      'Samsung '],
            [/^SAMSUNG/i,  'Samsung '],
            [/^Redmi/i,    'Xiaomi Redmi '],
            [/^POCO/i,     'POCO '],
            [/^CPH/i,      'OPPO '],
            [/^RMX/i,      'Realme '],
            [/^V\d{4}/i,   'Vivo '],
        ];
        for (const [pattern, prefix] of brands) {
            if (pattern.test(model)) {
                model = prefix + model.replace(pattern, '').trim();
                break;
            }
        }

        const androidVer = (ua.match(/Android\s([\d.]+)/i) || [])[1] || '';
        return `🤖 Android ${androidVer} | ${model}`;
    }

    // --- iOS: เดารุ่น iPhone จาก physical pixel (screen × devicePixelRatio) ---
    if (/iPhone/i.test(ua)) {
        const iosVer = (ua.match(/OS\s([\d_]+)/i) || [])[1]?.replace(/_/g, '.') || '';
        const px = Math.max(screen.width, screen.height);
        const ratio = window.devicePixelRatio || 1;
        const physH = px * ratio; // physical pixel จริง

        let model = 'iPhone';
        if      (physH >= 2796) model = 'iPhone 16 Pro Max / 15 Pro Max';
        else if (physH >= 2778) model = 'iPhone 14 Pro Max / 13 Pro Max';
        else if (physH >= 2688) model = 'iPhone 11 Pro Max / XS Max';
        else if (physH >= 2556) model = 'iPhone 16 Pro / 15 Pro / 14 Pro';
        else if (physH >= 2532) model = 'iPhone 16 / 15 / 14 / 13 / 12';
        else if (physH >= 2436) model = 'iPhone X / XS / 11 Pro';
        else if (physH >= 2340) model = 'iPhone 16e / 13 mini / 12 mini';
        else if (physH >= 2208) model = 'iPhone 8 Plus / 7 Plus / 6s Plus';
        else if (physH >= 1334) model = 'iPhone SE (2nd/3rd) / 8 / 7';
        else if (physH >= 1136) model = 'iPhone SE (1st gen) / 5s';
        else if (physH >= 960)  model = 'iPhone 4s';

        return `🍎 iOS ${iosVer} | ${model}`;
    }

    // --- iPad ---
    if (/iPad/i.test(ua)) {
        const iosVer = (ua.match(/OS\s([\d_]+)/i) || [])[1]?.replace(/_/g, '.') || '';
        const physH = Math.max(screen.width, screen.height) * (window.devicePixelRatio || 1);
        let model = 'iPad';
        if      (physH >= 2732) model = 'iPad Pro 12.9"';
        else if (physH >= 2388) model = 'iPad Pro 11"';
        else if (physH >= 2224) model = 'iPad Pro 10.5"';
        else if (physH >= 2160) model = 'iPad Air / iPad 10th gen';
        else if (physH >= 2048) model = 'iPad Air / iPad Pro 9.7"';
        else if (physH >= 1668) model = 'iPad Air / iPad mini';
        else if (physH >= 1536) model = 'iPad (Retina)';
        return `🍎 iPadOS ${iosVer} | ${model}`;
    }

    // --- Windows ---
    if (/Windows NT/i.test(ua)) {
        const ver = (ua.match(/Windows NT ([\d.]+)/i) || [])[1];
        const winMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
        const winVer = winMap[ver] || ver || '';
        const browser = /Edg/i.test(ua) ? 'Edge' : /OPR/i.test(ua) ? 'Opera' : /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : 'Browser';
        return `🪟 Windows ${winVer} | ${browser}`;
    }

    // --- Mac ---
    if (/Macintosh/i.test(ua)) {
        const macVer = (ua.match(/Mac OS X ([\d_]+)/i) || [])[1]?.replace(/_/g, '.') || '';
        return `🍎 macOS ${macVer}`;
    }

    // --- Linux ---
    if (/Linux/i.test(ua)) return '🐧 Linux';

    return '🖥️ Unknown Device';
}

async function notifyNewSuggestion({ ticketId, senderName, topic, detail, userIP, device }) {
    await sendDiscordNotification({
        username: "ระบบรับนโยบาย | พรรคกาดกระป๋อง",
        avatar_url: "https://cdn.discordapp.com/attachments/1507435953931686070/1507436640761548951/kew.jpg",
        content: "@here  มีไอเดียใหม่รอแอดมินตรวจสอบ! 🚀",
        embeds: [{
            title: "📥  ไอเดียใหม่เข้าระบบ!",
            description: `> *"${detail}"*`,
            color: COLOR_NEW,
            fields: [
                { name: "🎫  Ticket",  value: `\`${ticketId}\``,  inline: true  },
                { name: "👤  ผู้เสนอ", value: senderName,          inline: true  },
                { name: "📌  หัวข้อ",  value: `**${topic}**`,      inline: false },
                { name: "📱  อุปกรณ์", value: device || "Unknown", inline: true  },
                { name: "🔒  IP",      value: `\`${userIP}\``,     inline: true  }
            ],
            footer: { text: "กาดกระป๋อง • ระบบสภานักเรียน" },
            timestamp: new Date().toISOString()
        }]
    });
}

async function notifyApproved({ ticketId, title, proposer }) {
    await sendDiscordNotification({
        username: "ระบบบริหารนโยบาย | พรรคกาดกระป๋อง",
        avatar_url: "https://cdn.discordapp.com/attachments/1507435953931686070/1507436640761548951/kew.jpg",
        embeds: [{
            title: "✅  อนุมัตินโยบายแล้ว!",
            description: `นโยบาย **${title}** เปิดรับโหวตสาธารณะแล้ว`,
            color: COLOR_APPROVE,
            fields: [
                { name: "🎫  Ticket",  value: `\`${ticketId}\``, inline: true },
                { name: "👤  ผู้เสนอ", value: proposer,           inline: true }
            ],
            footer: { text: "กาดกระป๋อง • ระบบสภานักเรียน" },
            timestamp: new Date().toISOString()
        }]
    });
}

async function notifyDeleted({ ticketId, title }) {
    await sendDiscordNotification({
        username: "ระบบบริหารนโยบาย | พรรคกาดกระป๋อง",
        avatar_url: "https://cdn.discordapp.com/attachments/1507435953931686070/1507436640761548951/kew.jpg",
        embeds: [{
            title: "🗑️  ลบนโยบายออกจากระบบ",
            description: `Ticket \`${ticketId}\` — **${title || 'ไม่ทราบชื่อ'}** ถูกลบโดยแอดมิน`,
            color: COLOR_REJECT,
            footer: { text: "กาดกระป๋อง • ระบบสภานักเรียน" },
            timestamp: new Date().toISOString()
        }]
    });
}

async function notifyVoteMilestone({ policyId, title, votesYes, votesNo }) {
    const total = votesYes + votesNo;
    const milestones = [10, 25, 50, 100];
    const isMilestone = milestones.includes(total) || (total > 100 && total % 50 === 0);
    if (!isMilestone) return;
    const pctYes = Math.round((votesYes / total) * 100);
    const pctNo  = 100 - pctYes;
    const barYes = "🟩".repeat(Math.round(pctYes / 10));
    const barNo  = "🟥".repeat(10 - Math.round(pctYes / 10));
    await sendDiscordNotification({
        username: "ระบบโหวต | พรรคกาดกระป๋อง",
        avatar_url: "https://cdn.discordapp.com/attachments/1507435953931686070/1507436640761548951/kew.jpg",
        embeds: [{
            title: `🗳️  โหวตครบ ${total} ครั้ง!`,
            description: `นโยบาย **${title}** (Ticket \`${policyId}\`)`,
            color: COLOR_VOTE,
            fields: [
                { name: "👍  เอาด้วย", value: `**${votesYes}** คน (${pctYes}%)`, inline: true },
                { name: "👎  ไม่เอา",  value: `**${votesNo}** คน (${pctNo}%)`,   inline: true },
                { name: "📊  ผลโหวต",  value: `${barYes}${barNo}`,               inline: false }
            ],
            footer: { text: "กาดกระป๋อง • ระบบสภานักเรียน" },
            timestamp: new Date().toISOString()
        }]
    });
}

// ==========================================
// 🚩 4. ADMIN FUNCTIONS — ทั้งหมดเป็น Global
// ==========================================
window.checkPassword = function() {
    const pass = document.getElementById('adminPass').value;
    if (pass === ADMIN_PASSWORD) {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'block';
        window.loadAdminData();
    } else {
        alert('❌ รหัสผ่านไม่ถูกต้องสำหรับเจ้าหน้าที่พรรค!');
    }
};

window.loadAdminData = async function() {
    const client = getDB();
    if (!client) { console.error("DB not ready"); return; }

    const pendingTable = document.getElementById('pendingTable');
    const liveTable    = document.getElementById('liveTable');
    if (!pendingTable || !liveTable) return;

    pendingTable.innerHTML = '<tr><td colspan="5" class="px-6 py-6 text-center text-gray-500 text-sm">⏳ กำลังโหลด...</td></tr>';
    liveTable.innerHTML    = '<tr><td colspan="5" class="px-6 py-6 text-center text-gray-500 text-sm">⏳ กำลังโหลด...</td></tr>';

    const { data: policies, error } = await client
        .from('kpk_policies')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("loadAdminData error:", error);
        pendingTable.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-400 text-sm">❌ โหลดข้อมูลไม่สำเร็จ: ${error.message}</td></tr>`;
        return;
    }

    const pendingItems  = (policies || []).filter(p => p.status === 'pending');
    const approvedItems = (policies || []).filter(p => p.status === 'approved');

    if (pendingItems.length === 0) {
        pendingTable.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500 text-sm">ไม่มีข้อมูลนโยบายใหม่ค้างตรวจสอบ</td></tr>';
    } else {
        pendingTable.innerHTML = pendingItems.map(p => {
            const safeTitle    = (p.title    || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
            const safeProposer = (p.proposer || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
            const safeId       = (p.id       || '').replace(/'/g,"\\'");
            const descText     = p.description || p.desc || '';
            return `<tr class="border-b border-gray-800/50 hover:bg-gray-900/40 transition">
                <td class="px-6 py-4 text-sm font-bold text-green-400">${p.id}</td>
                <td class="px-6 py-4 text-sm text-gray-300">${p.proposer || ''}</td>
                <td class="px-6 py-4 text-sm text-white font-semibold">${p.title || ''}</td>
                <td class="px-6 py-4 text-sm text-gray-400 max-w-xs truncate" title="${descText}">${descText}</td>
                <td class="px-6 py-4 text-sm">
                    <div class="flex gap-2">
                        <button class="bg-green-500 hover:bg-green-400 text-black font-bold text-xs px-3 py-1.5 rounded transition whitespace-nowrap"
                            onclick="window.updateStatus('${safeId}', 'approved', '${safeTitle}', '${safeProposer}')">✅ อนุมัติ</button>
                        <button class="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs px-3 py-1.5 rounded border border-red-500/30 transition whitespace-nowrap"
                            onclick="window.deletePolicy('${safeId}', '${safeTitle}')">🗑️ ลบ</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    if (approvedItems.length === 0) {
        liveTable.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500 text-sm">ยังไม่มีนโยบายใดถูกปล่อยเข้าสู่หน้าโหวต</td></tr>';
    } else {
        liveTable.innerHTML = approvedItems.map(p => {
            const safeTitle = (p.title || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
            const safeId    = (p.id    || '').replace(/'/g,"\\'");
            return `<tr class="border-b border-gray-800/50 hover:bg-gray-900/40 transition">
                <td class="px-6 py-4 text-sm font-bold text-green-400">${p.id}</td>
                <td class="px-6 py-4 text-sm text-white font-semibold">${p.title || ''}</td>
                <td class="px-6 py-4 text-sm text-green-400 font-bold">${p.votes_yes ?? 0}</td>
                <td class="px-6 py-4 text-sm text-red-400 font-bold">${p.votes_no ?? 0}</td>
                <td class="px-6 py-4 text-sm">
                    <button class="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs px-3 py-1.5 rounded border border-red-500/30 transition whitespace-nowrap"
                        onclick="window.deletePolicy('${safeId}', '${safeTitle}')">🗑️ ลบโหวตออก</button>
                </td>
            </tr>`;
        }).join('');
    }
};

window.updateStatus = async function(id, newStatus, title, proposer) {
    const client = getDB();
    if (!client) return;

    const { error } = await client
        .from('kpk_policies')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) {
        console.error("updateStatus error:", error);
        alert(`❌ อัปเดตสถานะไม่สำเร็จ: ${error.message}`);
        return;
    }

    if (newStatus === 'approved') {
        await notifyApproved({ ticketId: id, title: title || id, proposer: proposer || '-' });
    }

    await window.loadAdminData();
};

window.deletePolicy = async function(id, title) {
    const client = getDB();
    if (!client) return;

    if (!confirm(`🚨 ยืนยันการลบ Ticket: ${id}\n"${title || ''}"\n\nการกระทำนี้ไม่สามารถย้อนกลับได้!`)) return;

    await notifyDeleted({ ticketId: id, title: title || id });

    const { error } = await client
        .from('kpk_policies')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("deletePolicy error:", error);
        alert(`❌ ลบข้อมูลไม่สำเร็จ: ${error.message}`);
        return;
    }

    await window.loadAdminData();
};

// ==========================================
// 🔄 5. DOM READY — suggest + vote pages
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // --- 📝 suggest.html ---
    const form = document.getElementById('discord-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn  = document.getElementById('submitBtn');
            const successMsg = document.getElementById('success-message');

            submitBtn.textContent = 'กำลังประมวลผล... ⏳';
            submitBtn.disabled = true;

            const senderName = document.getElementById('senderName').value.trim();
            const topic      = document.getElementById('topic').value.trim();
            const detail     = document.getElementById('detail').value.trim();
            const ticketId   = "TK-" + Math.floor(1000 + Math.random() * 9000);
            const device     = getDeviceType();

            const client = getDB();
            if (!client) {
                alert("ระบบฐานข้อมูลไม่พร้อมใช้งาน โปรดลองใหม่ครับ");
                submitBtn.textContent = 'ส่งข้อความเข้า Discord';
                submitBtn.disabled = false;
                return;
            }

            const { error } = await client.from('kpk_policies').insert([{
                id:          ticketId,
                proposer:    senderName,
                title:       topic,
                description: detail,
                status:      'pending',
                device:      device,
                votes_yes:   0,
                votes_no:    0
            }]);

            if (error) {
                console.error("insert error:", error);
                alert(`❌ บันทึกข้อมูลไม่สำเร็จ: ${error.message}`);
                submitBtn.textContent = 'ส่งข้อความเข้า Discord';
                submitBtn.disabled = false;
                return;
            }

            let userIP = "Unknown";
            try {
                const r = await fetch('https://api.ipify.org?format=json');
                userIP = (await r.json()).ip;
            } catch (_) {}

            await notifyNewSuggestion({ ticketId, senderName, topic, detail, userIP, device });

            successMsg.innerHTML = `✅ ออกรหัส <b>${ticketId}</b> สำเร็จ! ทีมงานได้รับไอเดียแล้ว รอแอดมินตรวจสอบก่อนเปิดโหวตนะครับ 🎉`;
            successMsg.classList.remove('hidden');
            form.reset();
            submitBtn.textContent = 'ส่งข้อความเข้า Discord';
            submitBtn.disabled = false;
            setTimeout(() => successMsg.classList.add('hidden'), 7000);
        });
    }

    // --- 🗳️ vote page ---
    const voteGrid = document.getElementById('voteGrid');
    if (voteGrid) {
        window.loadApprovedPolicies = async function() {
            const client = getDB();
            if (!client) return;

            const { data: policies, error } = await client
                .from('kpk_policies')
                .select('*')
                .eq('status', 'approved');

            if (error) { console.error("loadApprovedPolicies:", error); return; }

            const votedList = JSON.parse(localStorage.getItem('my_voted_policies')) || [];

            if (!policies || policies.length === 0) {
                voteGrid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800">ยังไม่มีนโยบายที่เปิดให้โหวตในขณะนี้ แวะมาดูใหม่น้าา~</div>';
                return;
            }

            voteGrid.innerHTML = policies.map(p => {
                const total    = p.votes_yes + p.votes_no;
                const pctYes   = total === 0 ? 50 : Math.round((p.votes_yes / total) * 100);
                const pctNo    = total === 0 ? 50 : 100 - pctYes;
                const hasVoted = votedList.includes(p.id);
                const safeId   = (p.id    || '').replace(/'/g,"\\'");
                const safeTitle= (p.title || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
                const descText = p.description || p.desc || '';
                return `
                <div class="bg-gray-900 border border-gray-800 hover:border-green-500/50 rounded-2xl p-6 transition duration-300 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <span class="bg-green-500/10 text-green-400 text-xs font-mono px-2.5 py-1 rounded-md border border-green-500/20">🎫 ${p.id}</span>
                            <span class="text-xs text-gray-500">ผู้เสนอ: ${p.proposer || ''}</span>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">💡 ${p.title || ''}</h3>
                        <p class="text-gray-400 text-sm leading-relaxed mb-6">${descText}</p>
                    </div>
                    <div>
                        <div class="w-full bg-gray-950 rounded-full h-8 overflow-hidden flex text-xs font-bold mb-4 border border-gray-800">
                            <div class="bg-green-500 text-black flex items-center justify-center transition-all duration-500" style="width:${pctYes}%">${pctYes}% (${p.votes_yes})</div>
                            <div class="bg-red-500 text-white flex items-center justify-center transition-all duration-500" style="width:${pctNo}%">${pctNo}% (${p.votes_no})</div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <button class="py-2.5 rounded-lg font-bold text-sm bg-green-500 hover:bg-green-400 text-black disabled:opacity-30 disabled:cursor-not-allowed transition"
                                ${hasVoted ? 'disabled' : ''} onclick="window.submitVote('${safeId}','yes','${safeTitle}')">👍 เอาด้วย</button>
                            <button class="py-2.5 rounded-lg font-bold text-sm bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 transition"
                                ${hasVoted ? 'disabled' : ''} onclick="window.submitVote('${safeId}','no','${safeTitle}')">👎 ไม่เอาอะ</button>
                        </div>
                        ${hasVoted ? '<p class="text-center text-xs text-gray-600 mt-3">✔ คุณโหวตแล้ว</p>' : ''}
                    </div>
                </div>`;
            }).join('');
        };

        window.submitVote = async function(policyId, type, title) {
            const client = getDB();
            if (!client) return;

            let votedList = JSON.parse(localStorage.getItem('my_voted_policies')) || [];
            if (votedList.includes(policyId)) return;

            const { error } = await client.rpc('vote_policy', { policy_id: policyId, vote_type: type });
            if (error) {
                console.error("submitVote:", error);
                alert("เกิดข้อผิดพลาด: รบกวนสร้างฟังก์ชัน 'vote_policy' ใน SQL Editor ของ Supabase ก่อนใช้งานนะครับ");
                return;
            }

            votedList.push(policyId);
            localStorage.setItem('my_voted_policies', JSON.stringify(votedList));

            const { data: updated } = await client
                .from('kpk_policies')
                .select('votes_yes, votes_no')
                .eq('id', policyId)
                .single();

            if (updated) {
                await notifyVoteMilestone({ policyId, title: title || policyId, votesYes: updated.votes_yes, votesNo: updated.votes_no });
            }

            window.loadApprovedPolicies();
        };

        window.loadApprovedPolicies();
    }
});

// ==========================================
// 🛡️ ANTI-COPY PROTECTION — จัดเต็ม
// ==========================================
(function() {

    // 1) บล็อก Right-click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // 2) บล็อก Drag
    document.addEventListener('dragstart', e => e.preventDefault());

    // 3) บล็อก keyboard shortcuts
    document.addEventListener('keydown', e => {
        if ([123, 116, 122].includes(e.keyCode)) { e.preventDefault(); return; }

        if (e.ctrlKey || e.metaKey) {
            if (['u','s','c','x','p','a'].includes(e.key.toLowerCase())) {
                e.preventDefault(); return;
            }
            if (e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase())) {
                e.preventDefault(); return;
            }
        }
    });

    // 4) บล็อก text selection
    document.addEventListener('selectstart', e => e.preventDefault());
    const noSelectStyle = document.createElement('style');
    noSelectStyle.textContent = `
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
        input, textarea {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            user-select: text !important;
        }
    `;
    document.head.appendChild(noSelectStyle);

    // 5) บล็อก Copy event
    document.addEventListener('copy',  e => e.preventDefault());
    document.addEventListener('cut',   e => e.preventDefault());
    document.addEventListener('paste', e => e.preventDefault());

    // ✅ ตรวจมือถือ — ข้ามการตรวจ DevTools ทั้งหมด
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    const devtoolsHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                    height:100vh;background:#030712;color:#ef4444;font-family:'Prompt',sans-serif;text-align:center;gap:16px">
            <div style="font-size:60px">🚫</div>
            <div style="font-size:24px;font-weight:bold">ห้ามใช้ Developer Tools</div>
            <div style="font-size:14px;color:#6b7280">กรุณาปิด DevTools แล้วรีเฟรชหน้าใหม่</div>
        </div>`;

    // 6) ตรวจขนาดหน้าต่าง (Desktop only)
    let devtoolsOpen = false;
    const threshold  = 160;
    function checkDevTools() {
        if (isMobile) return; 
        const widthDiff  = window.outerWidth  - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        if (widthDiff > threshold || heightDiff > threshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                document.body.innerHTML = devtoolsHTML;
            }
        } else {
            devtoolsOpen = false;
        }
    }
    setInterval(checkDevTools, 1000);

    setInterval(function() {
        if (isMobile) return; 
        const start = performance.now();
        debugger;
        if (performance.now() - start > 100) {
            document.body.innerHTML = devtoolsHTML;
        }
    }, 2000);

    // 8) บล็อก print
    window.addEventListener('beforeprint', e => e.preventDefault());
    window.print = function() { return false; };

    // 9) Watermark
    function addWatermark() {
        const wm = document.createElement('div');
        wm.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            pointer-events:none;z-index:9999;overflow:hidden;opacity:0.03;
        `;
        const text = `กาดกระป๋อง © ${new Date().getFullYear()}`;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 5; j++) {
                const span = document.createElement('span');
                span.textContent = text;
                span.style.cssText = `
                    position:absolute;
                    top:${i * 22}%;
                    left:${j * 25 - 10}%;
                    transform:rotate(-30deg);
                    font-size:18px;
                    font-weight:bold;
                    color:white;
                    white-space:nowrap;
                    font-family:'Prompt',sans-serif;
                `;
                wm.appendChild(span);
            }
        }
        document.body.appendChild(wm);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addWatermark);
    } else {
        addWatermark();
    }

})();