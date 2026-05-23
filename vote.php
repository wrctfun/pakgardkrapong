<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>โหวตนโยบาย - พรรคกาดกระป๋อง</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body class="bg-gray-950 text-white font-prompt min-h-screen flex flex-col">

    <nav class="w-full bg-gray-950/80 backdrop-blur-md z-50 border-b border-green-500/30">
        <div class="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
            <a href="index.html" class="flex items-center gap-2 hover:opacity-80">
                <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center text-black font-bold text-xl">ก</div>
                <span class="text-xl font-bold tracking-wider">กาดกระป๋อง</span>
            </a>
            <div class="text-sm font-medium flex gap-4">
                <a href="suggest.php" class="text-gray-400 hover:text-green-400 transition">💡 เสนอไอเดีย</a>
                <a href="index.php" class="text-gray-400 hover:text-green-400 transition">← หน้าแรก</a>
            </div>
        </div>
    </nav>

    <main class="flex-grow max-w-6xl w-full mx-auto px-4 py-12 relative">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-[120px] -z-10"></div>

        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-white mb-3">🗳️ โหวตนโยบายสภานักเรียน</h1>
            <p class="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">ร่วมแสดงพลังผ่านคะแนนโหวต ทุกความคิดเห็นของทุกคนจะถูกแปรเปลี่ยนเป็นนโยบายที่จะเกิดขึ้นจริงในโรงเรียน(มั้ง)</p>
        </div>

        <div id="voteGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="col-span-full text-center py-12 text-gray-500">กำลังเชื่อมต่อระบบ Real-Time Scores... ⏳</div>
        </div>
    </main>

    <footer class="text-center border-t border-gray-900 py-8 text-gray-600 text-xs bg-gray-950">
        <p>© 2026 Pakgardkrapong. All Rights Reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>