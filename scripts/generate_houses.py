import csv

TOTAL_HOUSES = 1349

with open("houses_master.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["no_rumah", "blok", "x", "y"])

    for i in range(1, TOTAL_HOUSES + 1):
        blok = "Merah" if i % 2 == 0 else "Kelabu"
        row = (i - 1) // 50
        col = (i - 1) % 50
        x = col * 20
        y = row * 30
        writer.writerow([i, blok, x, y])

print("houses_master.csv generated!")
