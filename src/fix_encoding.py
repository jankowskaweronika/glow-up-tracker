import re

with open('App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Dictionary of fixes as hex escape sequences to avoid shell issues
fixes = {
    '\xe2\x9c\xa8': '\u2728',  # ✨
    '\xc3\xa2\xc2\x9c\xc2\xa8': '\u2728',  # another ✨ pattern
    '\xc3\xb0\xc2\x9f\xc2\x93\xc2\x85': '\U0001F4C5',  # 📅
    '\xc3\xa2\xc2\xb0': '\u23F0',  # ⏰  
    '\xc3\xb0\xc2\x9f\xc2\x93\xc2\x8a': '\U0001F4CA',  # 📊
    '\xc3\xb0\xc2\x9f\xc2\x93\xc2\x88': '\U0001F4C8',  # 📈
    '\xc3\xb0\xc2\x9f\xc2\x93\xc2\x9d': '\U0001F4DD',  # 📝
    '\xc3\xb0\xc2\x9f\xc2\x83': '\U0001F3C3',  # 🏃
    '\xc3\xb0\xc2\x9f\xc2\x93\xc2\x96': '\U0001F4D6',  # 📖
    '\xc3\xb0\xc2\x9f\xc2\x98\xc2\xa2': '\U0001F622',  # 😢
    '\xc3\xa2\xc2\x9c\xc2\x94': '\u2714',  # ✔
    '\xc3\xa2\xc2\x9c\xc2\x95': '\u2715',  # ✕
    '\xc3\xa2\xc2\x9a\xc2\xa0': '\u26A0',  # ⚠
    '\xc3\xa2\xc2\x84\xc2\xb9': '\u2139',  # ℹ
    '\xc3\xb0\xc2\x9f\xc2\x8e\xc2\x89': '\U0001F389',  # 🎉
}

# Also fix via simple string patterns that we know exist
simple_fixes = [
    ('âœ¨', '✨'),
    ('ðŸ"…', '📅'),  
    ('â°', '⏰'),
    ('ðŸ"Š', '📊'),
    ('ðŸ"ˆ', '📈'),
    ('ðŸ"', '📝'),
    ('ðŸƒ', '🏃'),
    ('ðŸ"–', '📖'),
    ('ðŸ˜¢', '😢'),
    ('âœ"', '✔'),
    ('âœ•', '✕'),
    ('âš ', '⚠'),
    ('â„¹', 'ℹ'),
    ('ðŸŽ‰', '🎉'),
]

for wrong, right in simple_fixes:
    text = text.replace(wrong, right)

with open('App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done!")
