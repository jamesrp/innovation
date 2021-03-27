import random
import collections
import json
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

MAX_AGE = 2
AGES = list(range(1,MAX_AGE + 1))

def can_achieve(achievement_age, player_top_age, player_score):
    return player_top_age >= achievement_age and player_score >= 5*achievement_age

CARD_FIELDS = ['name', 'age', 'dogmas_english', 'dogmas_machine', 'symbols', 'main_symbol']

Card = collections.namedtuple('Card', CARD_FIELDS)

class CardData:
    def __init__(self):
        # TODO: populate from JSON.
        self.special_achievements = ["Monument", "World", "Universe", "Wonder", "Empire"] # TODO
        self.cards = []
        for i in AGES:
            self.cards.extend([Card("The Wheel", i, ["Draw two 1s."], ['draw_n(player,1,2)'], "HCCC", "C"), Card("Writing", i, ["Draw a 2."], ['draw(player,2)'], "HCBB", "B")]*5)
        print(self.cards)

class Player:
    def __init__(self, name):
        self.name = name
        self.hand = []
        self.board = []
        self.score = []
        self.achievements = []

    def top_age(self):
        if not self.board:
            return 0
        return max(card.age for card in self.board)

    def total_score(self):
        return sum(card.age for card in self.score)

    def ask(self, options, msg):
        print("asking player {} {}:\n{}".format(self.name, msg, "\n".join("[option {}] {}".format(i, x) for i,x in enumerate(options))))
        i = input("Answer by idx:")
        return options[int(i)] # TODO - parsing security

    def __str__(self):
        return 'hand: {}\nboard: {}\nscore: {}\nachievements: {}'.format(self.hand, self.board, self.score, self.achievements)
    def __repr__(self):
        return self.__str__()

# A PrintableFunction is a zero-arg fn together with a message
# which we use to print out the fn when we pass it around.
class PrintableFunction:
    def __init__(self, fn, msg):
        self.fn = fn
        self.msg = msg

    def __str__(self):
        return self.msg

    def __repr__(self):
        return self.msg

    def __call__(self):
        return self.fn()

class State:
    def __init__(self, players, card_data):
        self.game_over = False
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

    def edges(self):
        # Returns (Player, [Options]) - 
        # the edges leading out of this state.
        # Invariant is that the current player is players[0]
        # and they have 1-2 actions left.
        options = []
        current_player = self.players[0]
        top_age = current_player.top_age()
        score = current_player.total_score()
        options.append(self.draw_wrapper(current_player, top_age))
        for card in current_player.hand:
            options.append(self.meld_wrapper(current_player, card, current_player.hand))
        for card in current_player.board:
            options.append(self.dogma_wrapper(current_player, card))
        for achievement in self.achievements:
            if can_achieve(achievement.age, top_age, score):
                # TODO: this will break with Echoes' multiple copies
                # of the same achievement.
                options.append(self.achieve_wrapper(current_player, achievement))
        return current_player, options

    def draw_wrapper(self, player, age):
        fn = lambda: self.draw(player, age)
        msg = "{} draws a {}".format(player.name, age)
        return PrintableFunction(fn, msg)

    def draw_n(self, player, age, n):
        for _ in range(n):
            self.draw(player, age)

    def draw(self, player, age):
        if age >= MAX_AGE + 1:
            print("Game over due to drawing an 11!")
            self.game_over = True
            return
        if age <= 0:
            return draw(self, player, 1)
        deck = self.decks[age]
        if not deck:
            return self.draw(player, age+1)
        player.hand.append(deck.pop())

    def dogma_wrapper(self, player, card):
        fn = lambda: self.dogma(player, card)
        msg = "{} activates the dogma of {}".format(player.name, card)
        return PrintableFunction(fn, msg)

    def dogma(self, player, card):
        # TODO: card.dogma_machine is "draw(player, n) e.g. so we can just strcat.
        for ability in card.dogmas_machine:
            eval("self." + ability)

    def achieve_wrapper(self, player, achievement):
        fn = lambda: self.achieve(player, achievement)
        msg = "{} achieves {}".format(player.name, achievement)
        return PrintableFunction(fn, msg)
    
    def achieve(self, player, achievement):
        self.achievements.remove(achievement)
        player.achievements.append(achievement)

    def meld_wrapper(self, player, card, from_zone):
        fn = lambda: self.meld(player, card, from_zone)
        msg = "{} melds {}".format(player.name, card) # TODO: from where?
        return PrintableFunction(fn, msg)

    def meld(self, player, card, from_zone):
        player.board.append(card)
        from_zone.remove(card)

    def main_loop(self):
        while not self.game_over:
            current_player, options = self.edges()
            msg = "What to do for action {}?".format(3 - self.actions_remaining)
            selected_option = current_player.ask(options, msg)
            selected_option()
            self.actions_remaining -= 1
            if self.actions_remaining == 0:
                self.actions_remaining = 2
                self.players = self.players[1:] + [self.players[0]]

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
    state.main_loop()
    print(state)
    
