document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('discord-form');
    
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('success-message');

    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1507435981505302659/p92kQ0qmAQhMDXq_q4D1lCPGwILP-iDG5NqHa7pVOJaeGckrEWyfafpZC_G87ygxwB6J";

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const senderName = document.getElementById('senderName').value;
        const topic = document.getElementById('topic').value;
        const detail = document.getElementById('detail').value;

        submitBtn.innerHTML = 'กำลังส่งเรื่อง... ⏳';
        submitBtn.disabled = true;

        const payload = {
            username: "ระบบรับนโยบาย พรรคกาดกระป๋อง",
            avatar_url: "https://cdn.discordapp.com/attachments/1507435953931686070/1507436640761548951/kew.jpg?ex=6a11e545&is=6a1093c5&hm=029052e665d02eadccb4433e0a97f047b78a99d037fe1caf7dbf10e52eb49aac", 
            embeds: [
                {
                    title: "📥 มีไอเดีย/ข้อเสนอใหม่ส่งเข้ามา!",
                    color: 2278494, // สีเขียวในระบบเลขฐานสิบ
                    fields: [
                        { name: "👤 ผู้เสนอ", value: senderName, inline: true },
                        { name: "📌 เรื่อง", value: topic, inline: true },
                        { name: "📝 รายละเอียด", value: detail }
                    ],
                    footer: { text: "กาดกระป๋องสภานักเรียน" },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        try {
            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                form.reset();
                successMsg.classList.remove('hidden');
                setTimeout(() => {
                    successMsg.classList.add('hidden');
                }, 6000);
            } else {
                alert('เกิดข้อผิดพลาดจากทางเซิร์ฟเวอร์ Discord กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('ไม่สามารถส่งข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
        } finally {
            submitBtn.innerHTML = '<span>ส่งข้อเสนอแนะ</span>';
            submitBtn.disabled = false;
        }
    });
});

/* --- ระบบป้องกันการก๊อปปี้แบบจัดเต็ม (JavaScript) --- */

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('dragstart', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
    }
    
    if (e.ctrlKey || e.metaKey) { 
        if (e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
        }
        if (e.key === 'U' || e.key === 'u') {
            e.preventDefault();
        }
        if (e.key === 'S' || e.key === 's') {
            e.preventDefault();
        }
        if (e.key === 'C' || e.key === 'c' || e.key === 'X' || e.key === 'x' || e.key === 'P' || e.key === 'p') {
            e.preventDefault();
        }
    }
});