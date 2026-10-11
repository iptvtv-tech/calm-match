#!/usr/bin/env python3
"""Copy the symbols Calm Match uses into site/symbols/ and write site/js/symbols.js.

Most symbols come from the Mulberry Symbol set by Steve Lee (CC BY-SA 4.0):
    git clone --depth 1 https://github.com/mulberrysymbols/mulberry-symbols.git
    python3 tools/build-symbols.py path/to/mulberry-symbols
A few words Mulberry doesn't draw (you, not, stop and similar) are simple symbols made for
Calm Match in tools/symbols-own/, shared under the same licence.

To add a symbol: add a line to LIST (id, English, Irish, Mulberry file or "own"), run the script,
then bump VERSION in site/sw.js. Ids are stored in saved boards, so never rename one.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, "..", "site")
OUT = os.path.join(SITE, "symbols")

# (id, English, Irish, source). Groups are for the picker in the grown-ups area.
LIST = {
  "core": [
    ("i", "I", "mé", "I.svg"), ("you", "you", "tú", "own"), ("he", "he", "sé", "own"), ("she", "she", "sí", "own"), ("it", "it", "é", "own"),
    ("want", "want", "ba mhaith liom", "want_,_to.svg"), ("like", "like", "is maith liom", "own"), ("not", "not", "ní", "own"),
    ("more", "more", "níos mó", "more.svg"), ("help", "help", "cabhair", "help_,_to.svg"), ("stop", "stop", "stop", "own"),
    ("go", "go", "téigh", "go_,_to.svg"), ("look", "look", "féach", "look_,_to.svg"), ("get", "get", "faigh", "get_,_to.svg"),
    ("make", "make", "déan", "make_,_to.svg"), ("put", "put", "cuir", "put_,_to.svg"), ("open", "open", "oscail", "open_,_to.svg"),
    ("turn", "turn", "cas", "turn_,_to.svg"), ("do", "do", "déan é", "own"), ("can", "can", "is féidir", "own"),
    ("good", "good", "go maith", "good.svg"), ("same", "same", "mar an gcéanna", "same.svg"), ("different", "different", "difriúil", "own"),
    ("all", "all", "gach", "own"), ("some", "some", "roinnt", "some.svg"), ("finished", "finished", "críochnaithe", "own"),
    ("in", "in", "isteach", "in.svg"), ("on", "on", "ar", "on.svg"), ("up", "up", "suas", "up.svg"),
    ("here", "here", "anseo", "own"), ("that", "that", "sin", "own"),
    ("what", "what", "cad", "what.svg"), ("where", "where", "cá", "where.svg"), ("who", "who", "cé", "who.svg"),
    ("when", "when", "cathain", "own"), ("why", "why", "cén fáth", "own"),
  ],
  "quick": [
    ("yes", "yes", "is ea", "own"), ("no", "no", "ní hea", "own"), ("break", "break", "sos", "own"), ("wait", "wait", "fan", "wait_,_to.svg"),
  ],
  "feelings": [
    ("happy", "happy", "sásta", "happy_lady.svg"), ("sad", "sad", "brónach", "sad_lady.svg"), ("angry", "angry", "crosta", "angry_lady.svg"),
    ("worried", "worried", "buartha", "worried_lady.svg"), ("surprised", "surprised", "ionadh", "surprised_lady.svg"),
    ("excited", "excited", "ar bís", "excited_lady.svg"), ("scared", "scared", "scanraithe", "afraid_man.svg"), ("tired", "tired", "tuirseach", "yawn_,_to.svg"),
    ("thirsty", "thirsty", "tart", "thirsty.svg"), ("feel", "feel", "mothaigh", "own"), ("cold", "cold", "fuar", "own"), ("hurt", "hurt", "gortaithe", "own"), ("hungry", "hungry", "ocras", "hungry.svg"), ("hot", "hot", "te", "hot.svg"),
    ("quiet", "quiet", "ciúin", "quiet.svg"), ("loud", "loud", "glórach", "loud.svg"),
  ],
  "daily": [
    ("toilet", "toilet", "leithreas", "toilet.svg"), ("flush", "flush the toilet", "sruthlaigh", "flush_toilet_,_to.svg"),
    ("washhands", "wash hands", "nigh do lámha", "wash_hands_,_to.svg"), ("soap", "soap", "gallúnach", "soap.svg"), ("towel", "towel", "tuáille", "towel.svg"),
    ("tap", "tap", "sconna", "tap.svg"), ("brushteeth", "brush teeth", "scuab fiacla", "brush_teeth_,_to.svg"), ("teeth", "teeth", "fiacla", "teeth.svg"),
    ("mirror", "mirror", "scáthán", "mirror.svg"),
    ("toothbrush", "toothbrush", "scuab fiacla", "toothbrush.svg"), ("toothpaste", "toothpaste", "taos fiacla", "toothpaste.svg"),
    ("sink", "sink", "doirteal", "sink.svg"), ("rinse", "rinse", "sruthlaigh", "rinse_,_to.svg"), ("mouth", "mouth", "béal", "teeth_2.svg"),
    ("washface", "wash your face", "nigh d'aghaidh", "wash_face_,_to.svg"), ("getup", "get up", "éirigh", "get_up_,_to.svg"), ("getdressed", "get dressed", "cuir ort", "get_dressed_,_to.svg"),
    ("pyjamas", "pyjamas", "pitseámaí", "pyjamas.svg"), ("jumper", "jumper", "geansaí", "jumper.svg"), ("pants", "pants", "fo-éadaí", "pants.svg"),
    ("trainers", "shoes", "bróga", "trainers.svg"), ("coat", "coat", "cóta", "coat.svg"), ("breakfast", "breakfast", "bricfeasta", "breakfast_1.svg"),
    ("lunch", "lunch", "lón", "lunch_1.svg"), ("lunchbox", "lunch box", "bosca lóin", "lunch_box.svg"), ("dinner", "dinner", "dinnéar", "dinner.svg"),
    ("eat", "eat", "ith", "eat_,_to.svg"), ("drink", "drink", "ól", "drink_,_to.svg"), ("water", "water", "uisce", "water.svg"),
    ("bath", "bath", "folcadh", "bath.svg"), ("bedtime", "bedtime", "am luí", "bed_time.svg"), ("sleep", "sleep", "codladh", "sleep_male_,_to.svg"),
    ("clock", "clock", "clog", "clock.svg"), ("sit", "sit", "suigh", "sit_,_to.svg"), ("stand", "stand", "seas", "stand_,_to.svg"),
    ("queue", "line up", "líne", "queue_,_to.svg"), ("walk", "walk", "siúil", "walk_,_to.svg"), ("run", "run", "rith", "run_,_to.svg"),
    ("jump", "jump", "léim", "jump_,_to.svg"), ("hug", "hug", "barróg", "hug_,_to.svg"), ("share", "share", "roinn", "share_,_to.svg"),
    ("play", "play", "súgradh", "play_,_to.svg"), ("read", "read", "léigh", "read_book_,_to.svg"), ("draw", "draw", "tarraing", "draw_,_to.svg"),
    ("music", "music", "ceol", "music.svg"), ("swim", "swim", "snámh", "swim_,_to.svg"), ("point", "point", "taispeáin", "point_,_to.svg"),
  ],
  "places": [
    ("home", "home", "baile", "house.svg"), ("school", "school", "scoil", "school.svg"), ("classroom", "classroom", "seomra ranga", "class_room.svg"),
    ("schoolbag", "school bag", "mála scoile", "school_bag.svg"), ("outside", "outside", "amuigh", "outside.svg"), ("park", "park", "páirc", "park_,_to.svg"), ("garden", "garden", "gairdín", "back_garden.svg"),
    ("shop", "shop", "siopa", "shop.svg"), ("beach", "beach", "trá", "beach.svg"), ("car", "car", "carr", "car.svg"), ("bus", "bus", "bus", "bus.svg"),
    ("plane", "plane", "eitleán", "plane.svg"), ("fireengine", "fire engine", "inneall dóiteáin", "fire_engine.svg"),
  ],
  "people": [
    ("mum", "Mum", "Mam", "mum_parent.svg"), ("dad", "Dad", "Daid", "dad_parent.svg"), ("brother", "brother", "deartháir", "brother.svg"),
    ("sister", "sister", "deirfiúr", "sister.svg"), ("baby", "baby", "leanbh", "baby.svg"), ("teacher", "teacher", "múinteoir", "teacher_1a.svg"),
    ("doctor", "doctor", "dochtúir", "doctor_1a.svg"), ("dentist", "dentist", "fiaclóir", "dentist_1a.svg"), ("nurse", "nurse", "altra", "nurse_1a.svg"),
    ("granny", "Granny", "Mamó", "own"), ("grandad", "Grandad", "Daideo", "own"), ("friend", "friend", "cara", "own"),
    ("haircut", "haircut", "bearradh gruaige", "haircut.svg"), ("dog", "dog", "madra", "dog.svg"), ("cat", "cat", "cat", "cat.svg"),
  ],
  "social": [
    ("hello", "hello", "dia duit", "hello.svg"), ("goodbye", "goodbye", "slán", "own"), ("please", "please", "le do thoil", "own"),
    ("thankyou", "thank you", "go raibh maith agat", "own"), ("sorry", "sorry", "tá brón orm", "own"), ("myturn", "my turn", "mo sheal", "own"),
    ("yourturn", "your turn", "do sheal", "own"), ("again", "again", "arís", "own"), ("come", "come", "tar", "come_,_to.svg"),
  ],
  "describe": [
    ("big", "big", "mór", "own"), ("little", "little", "beag", "little.svg"), ("wet", "wet", "fliuch", "wet.svg"), ("dirty", "dirty", "salach", "dirty.svg"),
    ("broken", "broken", "briste", "broken.svg"), ("down", "down", "síos", "down.svg"), ("out", "out", "amach", "out.svg"), ("off", "off", "as", "off.svg"),
    ("under", "under", "faoi", "under_1.svg"),
  ],
  "body": [
    ("head", "head", "ceann", "head.svg"), ("ear", "ear", "cluas", "ear.svg"), ("eyes", "eyes", "súile", "eyes.svg"), ("tummy", "tummy", "bolg", "stomach_1.svg"),
    ("arm", "arm", "lámh", "arm.svg"), ("leg", "leg", "cos", "leg.svg"), ("feet", "feet", "cosa", "feet.svg"), ("plaster", "plaster", "plástar", "plaster.svg"),
  ],
  "food": [
    ("apple", "apple", "úll", "apple.svg"), ("banana", "banana", "banana", "banana.svg"), ("grapes", "grapes", "fíonchaora", "grapes.svg"),
    ("strawberry", "strawberry", "sú talún", "strawberry.svg"), ("yogurt", "yogurt", "iógart", "yogurt.svg"), ("cheese", "cheese", "cáis", "cheese.svg"),
    ("toast", "toast", "tósta", "toast.svg"), ("cereal", "cereal", "gránach", "cereal.svg"), ("sandwich", "sandwich", "ceapaire", "sandwich.svg"),
    ("pasta", "pasta", "pasta", "pasta.svg"), ("pizza", "pizza", "píotsa", "pizza.svg"), ("chips", "chips", "sceallóga", "chips.svg"),
    ("crisps", "crisps", "criospaí", "crisps.svg"), ("biscuit", "biscuit", "briosca", "biscuits.svg"), ("icecream", "ice cream", "uachtar reoite", "ice_cream.svg"),
    ("chocolate", "chocolate", "seacláid", "chocolate.svg"), ("milk", "milk", "bainne", "milk.svg"), ("orangejuice", "orange juice", "sú oráiste", "orange_juice.svg"),
    ("applejuice", "apple juice", "sú úll", "apple_juice.svg"), ("squash", "squash", "scuais", "squash.svg"), ("hotchocolate", "hot chocolate", "seacláid the", "hot_chocolate.svg"),
  ],
  "play": [
    ("ball", "ball", "liathróid", "ball.svg"), ("bubbles", "bubbles", "boilgeoga", "bubbles.svg"), ("blocks", "blocks", "bloic", "bricks.svg"),
    ("teddy", "teddy", "teidí", "teddy_bear.svg"), ("toycar", "toy car", "carr bréagáin", "car_toy.svg"), ("doll", "doll", "bábóg", "doll.svg"),
    ("puzzle", "puzzle", "míreanna mearaí", "jigsaw_puzzle.svg"), ("crayons", "crayons", "criáin", "crayon.svg"), ("playdough", "play dough", "márla", "playdough.svg"),
    ("paint", "paint", "péint", "paint.svg"), ("book", "book", "leabhar", "read_book_,_to.svg"), ("tv", "TV", "teilifís", "childrens_tv.svg"),
    ("game", "computer game", "cluiche ríomhaire", "computer_game.svg"), ("trampoline", "trampoline", "trampailín", "trampoline.svg"),
    ("swing", "swing", "luascán", "swing.svg"), ("slide", "slide", "sleamhnán", "slide.svg"), ("sandpit", "sandpit", "bosca gainimh", "sand_pit.svg"),
    ("bike", "bike", "rothar", "bicycle.svg"),
  ],
  "comfort": [
    ("blanket", "blanket", "pluid", "blanket.svg"), ("headphones", "headphones", "cluasáin", "headphones.svg"), ("squeeze", "squeeze", "fáisc", "squeeze_,_to.svg"),
    ("tickle", "tickle", "cigilt", "tickle_,_to.svg"), ("rock", "rock", "luasc", "rock_chair_,_to.svg"), ("lightsoff", "lights off", "múch an solas", "turn_down_light_,_to.svg"),
  ],
}

def minify(svg):
    svg = re.sub(r"<\?xml[^>]*>|<!--.*?-->|<!DOCTYPE[^>]*>", "", svg, flags=re.S)
    svg = re.sub(r"\s+", " ", svg).replace("> <", "><").strip()
    # Scale by the viewBox so the symbol fits its button.
    svg = re.sub(r'(<svg[^>]*?)\s(width|height)="[^"]*"', r"\1", svg, count=2)
    return svg

def main():
    src = sys.argv[1] if len(sys.argv) > 1 else None
    os.makedirs(OUT, exist_ok=True)
    manifest, missing = {}, []
    for group, rows in LIST.items():
        for sid, en, ga, f in rows:
            path = os.path.join(HERE, "symbols-own", sid + ".svg") if f == "own" else (os.path.join(src, "EN", f) if src else None)
            if not path or not os.path.exists(path):
                if os.path.exists(os.path.join(OUT, sid + ".svg")):
                    manifest[sid] = [en, ga, group]; continue
                missing.append(f"{sid} ({f})"); continue
            svg = minify(open(path, encoding="utf-8").read())
            open(os.path.join(OUT, sid + ".svg"), "w", encoding="utf-8").write(svg)
            manifest[sid] = [en, ga, group]
    js = ("/* Symbols in site/symbols/. Made by tools/build-symbols.py: edit the list there, not here.\n"
          "   Mulberry Symbols by Steve Lee, CC BY-SA 4.0 (mulberrysymbols.org). Own symbols: same licence. */\n"
          "window.CM = window.CM || {};\nCM.SYMBOLS = " + json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + ";\n"
          "CM.SYMBOL_GROUPS = " + json.dumps(list(LIST.keys())) + ";\n")
    open(os.path.join(SITE, "js", "symbols.js"), "w", encoding="utf-8").write(js)
    # The service worker reads this list to keep every symbol for offline use.
    json.dump(sorted(manifest.keys()), open(os.path.join(OUT, "index.json"), "w"))
    print(f"{len(manifest)} symbols written to site/symbols/.")
    if missing: print("Missing:", ", ".join(missing))

if __name__ == "__main__":
    main()
