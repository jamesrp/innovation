from bs4 import BeautifulSoup
import bs4
import re

f = open("Downloads/cards2.html")
html_doc = f.read()
f.close()

soup = BeautifulSoup(html_doc, 'html.parser')

ICON_MAP = {'icon_5': 'factory', 'icon_1': 'crown', 'icon_2': 'leaf', 'icon_4': 'castle', 'icon_6': 'clock', 'icon_3': 'bulb'}

def good_classes(cs):
	for x in cs:
		if x[:4] == "age_":
			return x.split('age_')[1]
		if x[:5] == "icon_":
			return ICON_MAP[x]
	return ','.join(cs)

def to_string(x):
	if type(x) == bs4.element.NavigableString:
		return str(x)
	elif type(x) == bs4.element.Tag:
		attrs = x.attrs
		if 'class' not in attrs:
			return ''
		return str(good_classes(x.attrs['class']))
	else:
		return "LOL" + str(x)

for d in soup.select('div.card'):
	output = []
	for e in d.select('div.card_title'):
		output.append(e.select('span')[0].contents[0])
	output.append(good_classes(d.attrs['class']))
	for e in d.select('span.effect_text'):
		dogmas = e.contents[3:]
		output.append("".join(to_string(x) for x in dogmas).replace('i_demand','I demand').strip())
	print("\t".join(output))
