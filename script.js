document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('discord-form');
    
    // หากอยู่ในหน้าแรกที่ไม่มีฟอร์ม จะข้ามการทำงานส่วนนี้ไปเพื่อป้องกัน Error
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