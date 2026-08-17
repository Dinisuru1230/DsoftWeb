import re

with open('/Users/pramodwijenayake/Desktop/Malmalee-Creations/Malmalee Creations 1 SRS.pdf', 'rb') as f:
    content = f.read()

text = content.decode('latin-1')

# Look for text streams in PDF (between BT and ET markers)
bt_et = re.findall(r'BT(.*?)ET', text, re.DOTALL)

readable = []
for block in bt_et:
    strings = re.findall(r'\(([^)]{2,})\)', block)
    for s in strings:
        clean = ''.join(c for c in s if 32 <= ord(c) <= 126)
        if len(clean) > 3 and any(c.isalpha() for c in clean):
            readable.append(clean)

output = '\n'.join(readable[:500])
print(output)
