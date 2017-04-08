
outfile = open('allCharacters.txt', 'w')

chars = set()

with open('./web/_js/atlas.js') as f:
	while True:
		c = f.read(1)
		if not c:
			chars = list(chars)
			chars = sorted(chars)
			string = ""
			for i in chars:
				string += i
			outfile.write(string)
			break

		chars.add(c)

