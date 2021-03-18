import random
# TODO: parse cards.json instead of hardcoding here
# TODO: implement draw and meld.
# TODO: implement dogma. (requires cards to have a functional dogma).
# TODO: implement dogma sharing, symbols, and share-draw.
# TODO: implement colors and top cards on your board.
# TODO: test out everything with the following cards:
# - The Wheel: draw two 1s.
# - Sailing: Draw and meld a 1.
# - WinButton: Achieve the lowest achievement.

# Later: Splay, demands, and 105 cards :)


AGES = list(range(1,11))

class Card:
    def __init__(self, name, age, dogmas, symbols, main_symbol):
        self.age = age
        self.name = name
        self.dogmas = dogmas
        self.symbols = symbols
        self.main_symbol = main_symbol

    def __str__(self):
        return "{} ({})".format(self.name, self.age)

    def __repr__(self):
        return self.__str__()

class CardData:
    def __init__(self):
        # TODO: populate from JSON.
        self.special_achievements = ["Monument", "World", "Universe", "Wonder", "Empire"] # TODO
        self.cards = []
        for i in AGES:
            self.cards.extend([Card("The Wheel", i, ["Draw two 1s."], "HCCC", "C"), Card("Writing", i, ["Draw a 2."], "HCBB", "B")]*5)

class Player:
    def __init__(self, name):
        self.name = name
        self.hand = []
        self.board = []
        self.score = []
        self.achievements = []

    def ask(self, options, msg):
        print("asking player {} {}:\n{}".format(self.name, msg, "\n".join("[option {}] {}".format(i, x) for i,x in enumerate(options))))
        i = input("Answer by idx:")
        return options[int(i)] # TODO - parsing security

    def __str__(self):
        return 'hand: {}\nboard: {}\nscore: {}\nachievements: {}'.format(self.hand, self.board, self.score, self.achievements)
    def __repr__(self):
        return self.__str__()


class State:
    def __init__(self, players, card_data):
        self.players = players
        self.decks = {i: [card for card in card_data.cards if card.age == i]  for i in AGES}
        for i in AGES:
            random.shuffle(self.decks[i])
        self.achievements = []
        for i in AGES[:-1]:
            self.achievements.append(self.decks[i].pop())
        self.special_achievements = list(card_data.special_achievements)
        for p in players:
            for i in range(2):
                p.hand.append(self.decks[1].pop())
            melded = p.ask(p.hand, "What to meld for turn 0?")
            p.board.append(melded)
            p.hand.remove(melded)
        self.players.sort(key = lambda p: p.board[0].name)
        self.actions_remaining = 1 # TODO: only works for 2p.

    def __str__(self):
        board = '\n'.join('deck {}: {}'.format(i, self.decks[i]) for i in self.decks)
        lines = ['player {} ({}):\n{}'.format(i, player.name, player) for i, player in enumerate(self.players)]
        lines.extend('deck {}: {}'.format(i, self.decks[i]) for i in self.decks)
        lines.append('achievements: {}'.format(self.achievements))
        lines.append('special_achievements: {}'.format(self.special_achievements))
        return '\n'.join(lines)

if __name__ == "__main__":
    players = [Player("James"), Player("Katharine")]
    card_data = CardData()
    state = State(players, card_data)
    print(state)
