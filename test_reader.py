from file_reader import read_file

filepath = "Backend\uploads\Unit-1 Notes.pdf"

text = read_file(filepath)

print("\n========== TEXT LENGTH ==========")
print(len(text))

print("\n========== TEXT ==========")
print(text[:3000])