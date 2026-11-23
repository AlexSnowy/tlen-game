// ===== Земли Тлена: данные контента =====
export const EL={phys:{n:'Физический',c:'#e8dcc0'},fire:{n:'Огонь',c:'#ff7a2a'},cold:{n:'Холод',c:'#7fd0ff'},light:{n:'Молния',c:'#f4f07a'},chaos:{n:'Яд',c:'#7aff5a'},holy:{n:'Свет',c:'#fff2b0'},arc:{n:'Тайная магия',c:'#9fd8ff'}};

export const CLASSES={
mage:{n:'Маг',role:'Заклинатель: огонь, лёд и молнии. Хрупкий, но сжигает толпы издалека.',model:'mage',hp:78,hpL:13,mana:70,manaL:8,armor:0,weapons:['wand','staff'],off:'book',hat:'Mage_Hat',cape:'Mage_Cape',branches:['Огонь','Лёд','Молния'],basicEl:'arc',ranged:1,col:'#7fb8ff'},
knight:{n:'Рыцарь',role:'Танк ближнего боя: клинок, щит и святой свет. Держит любой удар.',model:'knight',hp:115,hpL:18,mana:40,manaL:4,armor:20,weapons:['sword','gsword'],off:'shield',hat:'Knight_Helmet',cape:'Knight_Cape',branches:['Клинок','Щит','Свет'],basicEl:'phys',col:'#e8d090'},
rogue:{n:'Следопыт',role:'Стрелок и убийца: залпы болтов, тени и яды. Быстрый и смертоносный.',model:'rogue',hp:90,hpL:14,mana:55,manaL:5,armor:5,weapons:['xbow','hxbow'],off:'knife',hat:null,cape:'Rogue_Cape',branches:['Стрелы','Тени','Яды'],basicEl:'phys',ranged:1,col:'#9ae07a'},
barbarian:{n:'Варвар',role:'Берсерк с топорами: огромный урон по области, вампиризм, ярость.',model:'barbarian',hp:125,hpL:19,mana:35,manaL:4,armor:10,weapons:['axe','gaxe'],off:'bshield',hat:'Barbarian_Hat',cape:'Barbarian_Cape',branches:['Ярость','Земля','Кровь'],basicEl:'phys',col:'#ff8a5a'}};

// оружие и второе руки: mesh — имя меша в модели класса
export const WBASE={
wand:{n:'Жезл',cls:'mage',mesh:'1H_Wand',hands:1,dmg:[3,1.6,6,2.6],aps:1.45,range:11},
staff:{n:'Посох',cls:'mage',mesh:'2H_Staff',hands:2,dmg:[5,2.3,9,3.8],aps:1.25,range:11.5},
sword:{n:'Меч',cls:'knight',mesh:'1H_Sword',hands:1,dmg:[4,2,8,3],aps:1.5,range:2.3},
gsword:{n:'Двуручный меч',cls:'knight',mesh:'2H_Sword',hands:2,dmg:[7,3,13,4.6],aps:1.15,range:2.7},
xbow:{n:'Арбалет',cls:'rogue',mesh:'1H_Crossbow',hands:1,dmg:[3,1.8,7,2.8],aps:1.6,range:12},
hxbow:{n:'Тяжёлый арбалет',cls:'rogue',mesh:'2H_Crossbow',hands:2,dmg:[6,2.6,11,4.2],aps:1.25,range:13},
axe:{n:'Топор',cls:'barbarian',mesh:'1H_Axe',hands:1,dmg:[5,2.1,9,3.1],aps:1.4,range:2.3},
gaxe:{n:'Секира',cls:'barbarian',mesh:'2H_Axe',hands:2,dmg:[8,3.2,15,4.8],aps:1.1,range:2.8}};
export const OBASE={
book:{n:'Гримуар',cls:'mage',mesh:['Spellbook'],imp:{k:'mana',a:10,b:2}},
shield:{n:'Щит',cls:'knight',mesh:['Round_Shield','Badge_Shield','Rectangle_Shield','Spike_Shield'],imp:{k:'armor',a:8,b:4}},
knife:{n:'Кинжал',cls:'rogue',mesh:['Knife_Offhand'],imp:{k:'crit',a:2,b:.15}},
bshield:{n:'Щит',cls:'barbarian',mesh:['Barbarian_Round_Shield'],imp:{k:'armor',a:8,b:4}},
baxe:{n:'Топор левой руки',cls:'barbarian',mesh:['1H_Axe_Offhand'],imp:{k:'aspd',a:6,b:.3}}};
export const ALLW=['1H_Wand','2H_Staff','Spellbook','Spellbook_open','1H_Sword','2H_Sword','1H_Sword_Offhand','Round_Shield','Badge_Shield','Rectangle_Shield','Spike_Shield','1H_Crossbow','2H_Crossbow','Knife','Knife_Offhand','Throwable','1H_Axe','2H_Axe','1H_Axe_Offhand','Barbarian_Round_Shield','Mug'];

export const SLOTS=['weapon','offhand','helmet','chest','gloves','boots','ring','amulet'];
export const SLOT_N={weapon:'Оружие',offhand:'Вторая рука',helmet:'Шлем',chest:'Доспех',gloves:'Перчатки',boots:'Сапоги',ring:'Кольцо',amulet:'Амулет'};
export const ABASE={helmet:{n:['Шлем','Капюшон','Венец'],arm:[4,3]},chest:{n:['Доспех','Мантия','Кираса'],arm:[8,5]},gloves:{n:['Перчатки','Наручи'],arm:[3,2]},boots:{n:['Сапоги','Поножи'],arm:[3,2]},ring:{n:['Кольцо','Перстень']},amulet:{n:['Амулет','Талисман']}};

// свойства вещей: r(l) -> [мин,макс]
export const AFF={
dmgF:{t:'+{v} к урону',s:['weapon','ring','gloves','amulet'],r:l=>[1+l*.6,3+l*1.4],i:1},
dmgP:{t:'+{v}% урона',s:['weapon','amulet','ring','offhand'],r:l=>[6+l,15+l*3],i:1},
physP:{t:'+{v}% физ. урона',s:['weapon','gloves','amulet','offhand'],r:l=>[8+l,18+l*3],i:1},
fireP:{t:'+{v}% урона огнём',s:['weapon','ring','amulet','offhand','helmet'],r:l=>[8+l,18+l*3],i:1},
coldP:{t:'+{v}% урона холодом',s:['weapon','ring','amulet','offhand','helmet'],r:l=>[8+l,18+l*3],i:1},
lightP:{t:'+{v}% урона молнией',s:['weapon','ring','amulet','offhand','helmet'],r:l=>[8+l,18+l*3],i:1},
chaosP:{t:'+{v}% урона ядом',s:['weapon','ring','amulet','gloves'],r:l=>[8+l,18+l*3],i:1},
aoeP:{t:'+{v}% к области действия',s:['amulet','helmet','offhand'],r:l=>[5,12+l*.5],i:1},
hp:{t:'+{v} к здоровью',s:['helmet','chest','boots','gloves','ring','amulet','offhand'],r:l=>[8+l*4,20+l*8],i:1},
mana:{t:'+{v} к мане',s:['helmet','ring','amulet','weapon','offhand'],r:l=>[5+l*2,12+l*4],i:1},
manaRegen:{t:'+{v} маны в сек.',s:['ring','amulet','helmet','weapon'],r:l=>[1,2+l*.4],i:0},
aspd:{t:'+{v}% скорости атак и чар',s:['weapon','gloves','ring','offhand'],r:l=>[4,9+l*.6],i:1},
crit:{t:'+{v}% шанса крита',s:['weapon','ring','amulet','helmet','offhand'],r:l=>[2,5+l*.3],i:1},
critM:{t:'+{v}% крит. урона',s:['weapon','amulet','gloves'],r:l=>[10,25+l],i:1},
armor:{t:'+{v} к броне',s:['helmet','chest','boots','gloves','offhand'],r:l=>[4+l*3,10+l*6],i:1},
move:{t:'+{v}% скорости бега',s:['boots'],r:()=>[6,18],i:1},
regen:{t:'+{v} здоровья в сек.',s:['chest','amulet','ring','helmet'],r:l=>[1+l*.3,3+l*.8],i:0},
leech:{t:'{v}% урона в здоровье',s:['weapon','gloves','amulet','ring'],r:()=>[1,3],i:0},
cdr:{t:'+{v}% к скорости перезарядки',s:['helmet','amulet','gloves'],r:()=>[4,12],i:1},
gold:{t:'+{v}% золота',s:['helmet','ring','amulet','boots'],r:()=>[10,30],i:1},
rarity:{t:'+{v}% редкости добычи',s:['helmet','ring','amulet','boots'],r:()=>[8,24],i:1}};

export const UNIQUES=[
{n:'Сердце Пепла',slot:'amulet',base:'Амулет',st:{fireP:40,burnCh:100,hp:20},lore:'Оно всё ещё тёплое.'},
{n:'Шаги ветра',slot:'boots',base:'Сапоги',st:{move:30,dashCd:35,armor:10},lore:'Догони, если сможешь.'},
{n:'Корона Тлена',slot:'helmet',base:'Венец',st:{skillLvl:1,dmgP:15,hp:-25},lore:'Кто носит её — служит ей.'},
{n:'Кровавая клятва',slot:'ring',base:'Кольцо',st:{leech:3,dmgP:40,hpP:-15},lore:'Плата взимается кровью.'},
{n:'Ледяной шёпот',slot:'ring',base:'Перстень',st:{coldP:45,chillStr:50,mana:20},lore:'Тише. Слышишь, как трещит лёд?'},
{n:'Бастион',slot:'chest',base:'Кираса',st:{armorP:80,hp:60,move:-8},lore:'Стены падают. Он — нет.'},
{n:'Длань бури',slot:'gloves',base:'Наручи',st:{lightP:40,chainAdd:1,aspd:8},lore:'Гром отвечает на зов.'},
{n:'Чумной венец',slot:'helmet',base:'Капюшон',st:{chaosP:45,spreadPoison:1,hp:30},lore:'Зараза — тоже дар.'},
{n:'Жезл Морга',slot:'weapon',wb:'wand',st:{skillLvl:1,fireP:30,coldP:30,lightP:30},lore:'Утопленник не отпускает своё.'},
{n:'Клятва паладина',slot:'weapon',wb:'sword',st:{holyP:50,regen:8,armorP:25},lore:'Свет не гаснет, пока стоит его рыцарь.'},
{n:'Шёпот тени',slot:'weapon',wb:'xbow',st:{projAdd:2,crit:5,critM:40},lore:'Первый болт ты не услышишь.'},
{n:'Раскол',slot:'weapon',wb:'gaxe',st:{physP:60,slamR:30,stunCh:15},lore:'Земля помнит каждый удар.'}];

export const ORBS={
trans:{n:'Сфера превращения',d:'Обычная вещь → магическая',w:30,c:'#9ec5ff'},
alt:{n:'Сфера перемен',d:'Перебросить свойства магической вещи',w:30,c:'#b0e0ff'},
aug:{n:'Сфера дополнения',d:'Добавить свойство магической вещи (до 2)',w:18,c:'#c0d0ff'},
regal:{n:'Царская сфера',d:'Магическая → редкая, +1 свойство',w:8,c:'#ffe680'},
chaos:{n:'Сфера хаоса',d:'Перебросить все свойства редкой вещи',w:8,c:'#ffd36a'},
exalt:{n:'Сфера возвышения',d:'Добавить свойство редкой вещи (до 6)',w:1.6,c:'#fff3b0'},
divine:{n:'Божественная сфера',d:'Перебросить значения свойств',w:3,c:'#ffeedd'},
scour:{n:'Сфера очищения',d:'Убрать все свойства',w:6,c:'#cfcfcf'}};

/* ===== УМЕНИЯ =====
 kind: proj nova aoe ground chain cone slam wave whirl leap charge shadow barrage orb buff warcry aura summon trap totem mod
 m — множитель урона оружия на 1 уровне, mL — прибавка за уровень. Пассивные (mod) дают статы за уровень. */
const S=(o)=>o;
export const SKILLS={
// ---------- МАГ ----------
fireball:S({c:'mage',b:0,req:1,n:'Огненный шар',kind:'proj',el:'fire',mana:7,cd:0,m:1.5,mL:.22,p:{n:1,speed:20,explode:1.8,size:1.6},a:'cast',d:'Снаряд, взрывающийся при попадании.'}),
firering:S({c:'mage',b:0,req:1,n:'Огненное кольцо',kind:'nova',el:'fire',mana:16,cd:1.2,m:2.3,mL:.3,p:{r:5.5},a:'raise',d:'Волна огня вокруг мага.'}),
multiproj:S({c:'mage',b:0,req:3,n:'Множественные снаряды',kind:'mod',max:3,st:{projAdd:1},d:'+1 снаряд ко всем снарядным умениям за уровень.'}),
meteor:S({c:'mage',b:0,req:6,n:'Метеор',kind:'aoe',el:'fire',mana:22,cd:2.5,m:4.2,mL:.5,p:{r:3.3,delay:.8,meteor:1},a:'raise',d:'Падающий с неба метеор.'}),
burnground:S({c:'mage',b:0,req:8,n:'Пылающая земля',kind:'ground',el:'fire',mana:20,cd:3,m:1.1,mL:.15,p:{r:3.5,dur:4},a:'raise',d:'Поджигает землю: урон в секунду.'}),
ignite:S({c:'mage',b:0,req:10,n:'Поджог',kind:'mod',max:3,st:{burnCh:25,fireP:10},d:'Огненные удары поджигают врагов.'}),
armageddon:S({c:'mage',b:0,req:15,n:'Армагеддон',kind:'aoe',el:'fire',mana:45,cd:8,m:3.2,mL:.4,p:{r:2.6,delay:.6,count:9,spread:10,meteor:1},a:'long',d:'Дождь из метеоров по всей округе.'}),
icelance:S({c:'mage',b:1,req:1,n:'Ледяное копьё',kind:'proj',el:'cold',mana:6,cd:0,m:1.4,mL:.2,p:{n:1,speed:28,pierce:2,size:1.3},a:'cast',d:'Пронзающее ледяное копьё, замедляет.'}),
icenova:S({c:'mage',b:1,req:3,n:'Ледяной взрыв',kind:'nova',el:'cold',mana:15,cd:1.4,m:2,mL:.28,p:{r:6},a:'raise',d:'Морозная волна, сильно замедляет.'}),
pierce:S({c:'mage',b:1,req:4,n:'Пронзание',kind:'mod',max:3,st:{pierce:1,coldP:8},d:'Снаряды пронзают ещё одного врага за уровень.'}),
icearmor:S({c:'mage',b:1,req:5,n:'Ледяная броня',kind:'buff',mana:20,cd:12,p:{dur:8,st:{armorP:80,armor:30,dmgTaken:-15}},a:'buff',d:'Ледяная корка: броня и снижение урона.'}),
blizzard:S({c:'mage',b:1,req:9,n:'Буран',kind:'ground',el:'cold',mana:26,cd:3.5,m:1.3,mL:.18,p:{r:4.5,dur:4,blizzard:1},a:'long',d:'Снежная буря в области.'}),
frostbite:S({c:'mage',b:1,req:10,n:'Обморожение',kind:'mod',max:3,st:{chillStr:30,coldP:10},d:'Холод замедляет сильнее и бьёт больнее.'}),
iceorb:S({c:'mage',b:1,req:14,n:'Ледяная сфера',kind:'proj',el:'cold',mana:24,cd:1.5,m:3.6,mL:.4,p:{n:1,speed:9,pierce:99,size:3.2,life:2.4},a:'cast',d:'Огромная медленная сфера пробивает всех.'}),
spark:S({c:'mage',b:2,req:1,n:'Искры',kind:'proj',el:'light',mana:6,cd:0,m:.75,mL:.12,p:{n:4,spread:50,speed:15,wobble:1,life:1.2,size:1},a:'cast',d:'Россыпь блуждающих искр.'}),
chainlight:S({c:'mage',b:2,req:2,n:'Цепная молния',kind:'chain',el:'light',mana:9,cd:0,m:1.5,mL:.2,p:{chains:3,range:12},a:'cast',d:'Молния перескакивает между врагами.'}),
overload:S({c:'mage',b:2,req:4,n:'Перегрузка',kind:'mod',max:3,st:{chainAdd:1,lightP:8},d:'+1 перескок молнии за уровень.'}),
energyshield:S({c:'mage',b:2,req:6,n:'Энергетический щит',kind:'buff',mana:25,cd:14,p:{dur:8,shield:.45},a:'buff',d:'Щит поглощает урон (45% здоровья).'}),
shocknova:S({c:'mage',b:2,req:7,n:'Шоковая нова',kind:'nova',el:'light',mana:18,cd:1.6,m:2.4,mL:.3,p:{r:6.5},a:'raise',d:'Взрыв молний вокруг, шокирует.'}),
balllight:S({c:'mage',b:2,req:11,n:'Шаровая молния',kind:'orb',el:'light',mana:22,cd:1.8,m:.55,mL:.08,p:{speed:5,r:4,tick:.25,life:4},a:'cast',d:'Медленный шар бьёт молниями всех рядом.'}),
resonance:S({c:'mage',b:2,req:12,n:'Резонанс стихий',kind:'mod',max:3,st:{fireP:8,coldP:8,lightP:8,shockCh:10},d:'Усиливает весь стихийный урон.'}),
// ---------- РЫЦАРЬ ----------
cleave:S({c:'knight',b:0,req:1,n:'Рассекающий удар',kind:'cone',el:'phys',mana:5,cd:0,m:1.6,mL:.22,p:{r:3,arc:150},a:'melee',d:'Широкий удар по всем врагам впереди.'}),
bladestorm:S({c:'knight',b:0,req:2,n:'Вихрь клинков',kind:'whirl',el:'phys',mana:14,cd:3,m:.6,mL:.08,p:{r:3.2,dur:2.5,tick:.22},a:'spin',d:'Вращение с мечом: урон всем вокруг.'}),
wide:S({c:'knight',b:0,req:3,n:'Широкий замах',kind:'mod',max:3,st:{aoeP:12,meleeP:6},d:'Больше область ближнего боя.'}),
leapslam:S({c:'knight',b:0,req:5,n:'Удар в прыжке',kind:'leap',el:'phys',mana:14,cd:3,m:2.4,mL:.3,p:{r:3.2,range:12},a:'leap',d:'Прыжок к врагу и удар по области.'}),
flurry:S({c:'knight',b:0,req:8,n:'Шквал',kind:'cone',el:'phys',mana:10,cd:.8,m:.95,mL:.14,p:{r:2.8,arc:110,hits:3},a:'melee',d:'Три быстрых удара подряд.'}),
bleedmod:S({c:'knight',b:0,req:9,n:'Кровотечение',kind:'mod',max:3,st:{bleed:20,physP:8},d:'Физические удары вызывают кровотечение.'}),
justice:S({c:'knight',b:0,req:13,n:'Клинок правосудия',kind:'proj',el:'holy',mana:24,cd:2.5,m:3.4,mL:.4,p:{n:1,speed:18,pierce:99,size:3.4,life:.8,wave:1},a:'slam',d:'Волна света рассекает ряды врагов.'}),
shieldbash:S({c:'knight',b:1,req:1,n:'Удар щитом',kind:'cone',el:'phys',mana:6,cd:1,m:1.3,mL:.18,p:{r:2.5,arc:90,stun:1},a:'bash',d:'Оглушает врагов перед рыцарем.'}),
warcry:S({c:'knight',b:1,req:3,n:'Боевой клич',kind:'warcry',mana:10,cd:9,p:{r:7,dur:6,st:{armorP:40,dmgP:10},stun:1},a:'cry',d:'Оглушает врагов, усиливает броню.'}),
steelskin:S({c:'knight',b:1,req:2,n:'Стальная кожа',kind:'mod',max:3,st:{armorP:15,hp:10},d:'Больше брони и здоровья.'}),
shieldcharge:S({c:'knight',b:1,req:6,n:'Рывок щитом',kind:'charge',el:'phys',mana:10,cd:2.5,m:1.8,mL:.25,p:{dist:10,stun:1},a:'bash',d:'Таран сквозь врагов с оглушением.'}),
fortress:S({c:'knight',b:1,req:8,n:'Крепость',kind:'buff',mana:18,cd:15,p:{dur:6,st:{dmgTaken:-40}},a:'buff',d:'Получаемый урон снижен на 40%.'}),
reflect:S({c:'knight',b:1,req:10,n:'Отражение',kind:'mod',max:3,st:{reflect:15,armor:10},d:'Возвращает часть урона в ближнем бою.'}),
earthquake:S({c:'knight',b:1,req:14,n:'Землетрясение',kind:'slam',el:'phys',mana:26,cd:3,m:3,mL:.35,p:{r:5,after:1},a:'slam',d:'Удар по земле и запоздалый толчок.'}),
hammer:S({c:'knight',b:2,req:2,n:'Святой молот',kind:'aoe',el:'holy',mana:10,cd:.6,m:2,mL:.26,p:{r:2.4,delay:.25,hammer:1},a:'cast',d:'Молот света обрушивается на врага.'}),
determination:S({c:'knight',b:2,req:4,n:'Аура решимости',kind:'aura',p:{st:{armorP:50,regen:3}},a:'buff',d:'Пока в слоте: броня и восстановление. Резервирует 25% маны.'}),
blessing:S({c:'knight',b:2,req:3,n:'Благословение',kind:'mod',max:3,st:{regen:2,hpP:4},d:'Здоровье восстанавливается быстрее.'}),
consecrate:S({c:'knight',b:2,req:7,n:'Освящённая земля',kind:'ground',el:'holy',mana:18,cd:6,m:.8,mL:.12,p:{r:4.5,dur:5,heal:1},a:'cast',d:'Лечит союзников и жжёт врагов.'}),
guardian:S({c:'knight',b:2,req:9,n:'Призыв стража',kind:'summon',mana:30,cd:20,p:{count:1,model:'knight',tint:'#9fd0ff',hp:3,dmg:1.4,sc:1.1,ghost:1},a:'summon',d:'Призрачный рыцарь сражается рядом.'}),
wrath:S({c:'knight',b:2,req:11,n:'Аура гнева',kind:'aura',p:{st:{holyP:30,lightP:30,dmgP:10}},a:'buff',d:'Пока в слоте: урон светом и молнией.'}),
zeal:S({c:'knight',b:2,req:12,n:'Праведный гнев',kind:'mod',max:3,st:{holyP:15,crit:1},d:'Умения света наносят больше урона.'}),
// ---------- СЛЕДОПЫТ ----------
volley:S({c:'rogue',b:0,req:1,n:'Залп',kind:'proj',el:'phys',mana:6,cd:0,m:.9,mL:.13,p:{n:5,spread:45,speed:26,size:1},a:'shoot',d:'Веер из пяти болтов.'}),
pshot:S({c:'rogue',b:0,req:1,n:'Пронзающий выстрел',kind:'proj',el:'phys',mana:6,cd:0,m:1.7,mL:.22,p:{n:1,speed:38,pierce:6,size:1.2},a:'shoot',d:'Мощный болт пробивает ряд врагов.'}),
extraproj:S({c:'rogue',b:0,req:3,n:'Лишний болт',kind:'mod',max:3,st:{projAdd:1,projP:6},d:'+1 снаряд за уровень.'}),
rainarrows:S({c:'rogue',b:0,req:6,n:'Дождь стрел',kind:'aoe',el:'phys',mana:16,cd:1.5,m:1,mL:.14,p:{r:1.5,delay:.35,count:8,spread:3,arrows:1},a:'shoot',d:'Ливень стрел накрывает область.'}),
explbolt:S({c:'rogue',b:0,req:8,n:'Разрывной болт',kind:'proj',el:'fire',mana:12,cd:.5,m:2.2,mL:.28,p:{n:1,speed:30,explode:2.6,size:1.3},a:'shoot',d:'Болт взрывается огнём.'}),
precision:S({c:'rogue',b:0,req:5,n:'Меткость',kind:'mod',max:3,st:{crit:2,critM:10},d:'Больше шанс и урон критических ударов.'}),
barrage:S({c:'rogue',b:0,req:12,n:'Шквал болтов',kind:'barrage',el:'phys',mana:20,cd:2.5,m:.8,mL:.1,p:{n:10,int:.07},a:'shoot',d:'Десять выстрелов подряд в одну цель.'}),
shadowstrike:S({c:'rogue',b:1,req:2,n:'Удар тени',kind:'shadow',el:'chaos',mana:10,cd:2,m:2.6,mL:.3,p:{range:14},a:'stab',d:'Телепорт за спину врага и удар.'}),
smoke:S({c:'rogue',b:1,req:4,n:'Дымовая шашка',kind:'buff',mana:12,cd:10,p:{dur:5,st:{move:35,dmgTaken:-25},blind:5},a:'throw',d:'Ослепляет врагов, ускоряет тебя.'}),
evasion:S({c:'rogue',b:1,req:3,n:'Ускользание',kind:'mod',max:3,st:{move:6,dashCd:10},d:'Быстрее бег и рывок.'}),
daggerwhirl:S({c:'rogue',b:1,req:6,n:'Вихрь кинжалов',kind:'whirl',el:'phys',mana:12,cd:3,m:.5,mL:.07,p:{r:3,dur:2,tick:.18},a:'spin',d:'Кружение с клинками.'}),
spiketrap:S({c:'rogue',b:1,req:8,n:'Ловушка с шипами',kind:'trap',el:'phys',mana:10,cd:1.2,m:3.2,mL:.4,p:{r:3},a:'throw',d:'Ставит ловушку, взрывается возле врага.'}),
assassin:S({c:'rogue',b:1,req:10,n:'Убийца',kind:'mod',max:3,st:{critM:20,execute:10},d:'Больше урона по раненым и криты сильнее.'}),
thousand:S({c:'rogue',b:1,req:14,n:'Тысяча клинков',kind:'proj',el:'phys',mana:26,cd:2.5,m:1.2,mL:.15,p:{n:16,spread:360,speed:22,size:1,life:.7},a:'throw',d:'Кольцо кинжалов во все стороны.'}),
poisonarrow:S({c:'rogue',b:2,req:2,n:'Ядовитый болт',kind:'proj',el:'chaos',mana:7,cd:0,m:1.2,mL:.18,p:{n:1,speed:28,size:1.2},a:'shoot',d:'Отравляет цель.'}),
poisoncloud:S({c:'rogue',b:2,req:4,n:'Облако яда',kind:'ground',el:'chaos',mana:16,cd:3,m:1,mL:.15,p:{r:4,dur:5},a:'throw',d:'Ядовитое облако на месте врага.'}),
toxins:S({c:'rogue',b:2,req:3,n:'Токсины',kind:'mod',max:3,st:{chaosP:15,poisonDur:15},d:'Яд сильнее и действует дольше.'}),
plaguetrap:S({c:'rogue',b:2,req:7,n:'Чумная ловушка',kind:'trap',el:'chaos',mana:14,cd:2,m:1.2,mL:.15,p:{r:3.5,cloud:1},a:'throw',d:'Ловушка выпускает облако яда.'}),
beasts:S({c:'rogue',b:2,req:9,n:'Ядовитые твари',kind:'summon',mana:28,cd:15,p:{count:2,model:'skeleton_minion',tint:'#7aff5a',hp:1.6,dmg:.9,sc:.9,poison:1},a:'summon',d:'Две твари сражаются за тебя и травят врагов.'}),
contagion:S({c:'rogue',b:2,req:11,n:'Заражение',kind:'mod',max:3,st:{spreadPoison:1,chaosP:8},d:'Яд переходит на соседей при смерти.'}),
deathmist:S({c:'rogue',b:2,req:13,n:'Смертельная мгла',kind:'aura',p:{st:{chaosP:20},mist:1},a:'buff',d:'Пока в слоте: враги вокруг получают урон ядом.'}),
// ---------- ВАРВАР ----------
heavystrike:S({c:'barbarian',b:0,req:1,n:'Мощный удар',kind:'cone',el:'phys',mana:6,cd:0,m:2.1,mL:.28,p:{r:2.8,arc:90,stunCh:20},a:'melee',d:'Тяжёлый удар, может оглушить.'}),
doublestrike:S({c:'barbarian',b:0,req:1,n:'Двойной удар',kind:'cone',el:'phys',mana:5,cd:0,m:1.05,mL:.15,p:{r:2.6,arc:70,hits:2},a:'melee',d:'Два быстрых удара.'}),
heavyhits:S({c:'barbarian',b:0,req:2,n:'Тяжёлые удары',kind:'mod',max:3,st:{meleeP:12,physP:6},d:'Ближний бой наносит больше урона.'}),
whirlwind:S({c:'barbarian',b:0,req:5,n:'Боевой вихрь',kind:'whirl',el:'phys',mana:14,cd:3,m:.75,mL:.1,p:{r:3.4,dur:3,tick:.2},a:'spin',d:'Вращение с топором, можно двигаться.'}),
berserk:S({c:'barbarian',b:0,req:7,n:'Берсерк',kind:'buff',mana:15,cd:14,p:{dur:7,st:{aspd:40,dmgP:30,armorP:-40}},a:'cry',d:'Ярость: быстрее и сильнее, но броня ниже.'}),
executemod:S({c:'barbarian',b:0,req:9,n:'Казнь',kind:'mod',max:3,st:{execute:20},d:'Больше урона по врагам с малым здоровьем.'}),
crusher:S({c:'barbarian',b:0,req:13,n:'Сокрушитель',kind:'slam',el:'phys',mana:24,cd:2.5,m:4,mL:.45,p:{r:4.5},a:'slam',d:'Сокрушительный удар по огромной области.'}),
fissure:S({c:'barbarian',b:1,req:2,n:'Раскол земли',kind:'wave',el:'phys',mana:10,cd:.8,m:1.6,mL:.22,p:{len:9,step:1.5,r:1.6},a:'slam',d:'Трещина бежит по земле вперёд.'}),
axeleap:S({c:'barbarian',b:1,req:3,n:'Прыжок с топором',kind:'leap',el:'phys',mana:12,cd:2.5,m:2.6,mL:.3,p:{r:3.4,range:13},a:'leap',d:'Прыжок в гущу врагов.'}),
shockwave:S({c:'barbarian',b:1,req:4,n:'Ударная волна',kind:'mod',max:3,st:{slamR:15,aoeP:6},d:'Удары по земле охватывают больше.'}),
axethrow:S({c:'barbarian',b:1,req:5,n:'Метание топоров',kind:'proj',el:'phys',mana:9,cd:0,m:1.2,mL:.18,p:{n:3,spread:30,speed:20,size:1.6,axe:1,pierce:1},a:'throw',d:'Три вращающихся топора.'}),
ancestralcry:S({c:'barbarian',b:1,req:8,n:'Крик предков',kind:'warcry',mana:12,cd:10,p:{r:8,dur:6,st:{dmgP:30,meleeP:15},stun:1},a:'cry',d:'Оглушает врагов, +30% урона.'}),
stunmod:S({c:'barbarian',b:1,req:10,n:'Оглушение',kind:'mod',max:3,st:{stunCh:8},d:'Удары чаще оглушают.'}),
totem:S({c:'barbarian',b:1,req:12,n:'Тотем предков',kind:'totem',el:'phys',mana:24,cd:12,m:1.6,mL:.2,p:{r:3.5,int:1,dur:12},a:'cast',d:'Тотем бьёт по земле вокруг себя.'}),
bloodlust:S({c:'barbarian',b:2,req:2,n:'Кровожадность',kind:'buff',mana:10,cd:12,p:{dur:8,st:{leech:4,aspd:10}},a:'cry',d:'Удары возвращают здоровье.'}),
harvest:S({c:'barbarian',b:2,req:3,n:'Кровавая жатва',kind:'nova',el:'phys',mana:14,cd:1.6,m:2,mL:.26,p:{r:5,bleed:1},a:'spin',d:'Кольцо крови, вызывает кровотечение.'}),
vitality:S({c:'barbarian',b:2,req:1,n:'Живучесть',kind:'mod',max:3,st:{hpP:8},d:'+8% к здоровью за уровень.'}),
bloodrage:S({c:'barbarian',b:2,req:6,n:'Ярость крови',kind:'aura',p:{st:{physP:25,regen:4}},a:'cry',d:'Пока в слоте: физ. урон и регенерация.'}),
sacrifice:S({c:'barbarian',b:2,req:8,n:'Жертва',kind:'nova',el:'phys',mana:0,cd:3,m:4.5,mL:.5,p:{r:6,hpCost:.15},a:'slam',d:'Тратит 15% здоровья на мощный взрыв.'}),
vampir:S({c:'barbarian',b:2,req:9,n:'Вампиризм',kind:'mod',max:3,st:{leech:1.5},d:'Часть урона возвращается здоровьем.'}),
undying:S({c:'barbarian',b:2,req:14,n:'Бессмертный рык',kind:'buff',mana:20,cd:30,p:{dur:4,immortal:1,heal:.35},a:'cry',d:'4 секунды нельзя умереть, лечит 35%.'})};

/* ===== ПАССИВНОЕ ДЕРЕВО: лучи по классам ===== */
export const RAYS={
mage:[{n:'Пламя',sm:{fireP:8},no:{n:'Душа пламени',st:{fireP:22,burnCh:10}},end:{n:'Пепельное сердце',st:{fireP:30,aoeP:10}}},
 {n:'Чары',sm:{dmgP:5,mana:8},no:{n:'Поток маны',st:{manaRegen:3,manaP:15}},end:{n:'Кровавая магия',key:1,st:{bloodMagic:1,hpP:25},d:'Умения тратят здоровье вместо маны.'}},
 {n:'Шторм',sm:{lightP:6,coldP:6},no:{n:'Громовержец',st:{lightP:20,chainAdd:1}},end:{n:'Сердце зимы',st:{coldP:30,chillStr:30}}}],
knight:[{n:'Сталь',sm:{armorP:10},no:{n:'Железная кожа',st:{armorP:30,hp:20}},end:{n:'Непробиваемый',st:{armorP:40,dmgTaken:-8}}},
 {n:'Доблесть',sm:{meleeP:7,hp:6},no:{n:'Мастер клинка',st:{meleeP:20,aspd:6}},end:{n:'Бастион веры',key:1,st:{armorP:60,dmgTaken:-10,move:-10},d:'Огромная защита, но медленнее шаг.'}},
 {n:'Святость',sm:{holyP:8,regen:.8},no:{n:'Свет веры',st:{holyP:20,regen:3}},end:{n:'Паладин',st:{holyP:30,auraP:20}}}],
rogue:[{n:'Меткость',sm:{crit:1,projP:4},no:{n:'Глаз сокола',st:{crit:3,critM:20}},end:{n:'Снайпер',st:{projP:25,pierce:1}}},
 {n:'Скорость',sm:{aspd:4,move:2},no:{n:'Ветер',st:{aspd:10,move:6}},end:{n:'Удача убийцы',key:1,st:{critX:100,critM:-40},d:'Шанс крита удвоен, но криты слабее.'}},
 {n:'Яды',sm:{chaosP:8},no:{n:'Чумной',st:{chaosP:20,poisonDur:20}},end:{n:'Мор',st:{chaosP:30,spreadPoison:1}}}],
barbarian:[{n:'Сила',sm:{physP:8},no:{n:'Мощь',st:{physP:20,meleeP:10}},end:{n:'Титан',st:{physP:30,slamR:20}}},
 {n:'Ярость',sm:{aspd:3,dmgP:4},no:{n:'Неистовство',st:{aspd:8,dmgP:12}},end:{n:'Безрассудство',key:1,st:{dmgP:45,armorP:-50},d:'+45% урона, но броня вдвое меньше.'}},
 {n:'Жизнь',sm:{hpP:4,regen:.6},no:{n:'Неукротимость',st:{hpP:12,leech:1}},end:{n:'Бессмертный',st:{hpP:20,regen:5}}}]};
export const STAT_N={dmgP:'% урона',physP:'% физ. урона',fireP:'% урона огнём',coldP:'% урона холодом',lightP:'% урона молнией',chaosP:'% урона ядом',holyP:'% урона светом',meleeP:'% урона в ближнем бою',projP:'% урона снарядами',aoeP:'% области',
hp:' к здоровью',hpP:'% здоровья',mana:' к мане',manaP:'% маны',manaRegen:' маны/сек',regen:' здоровья/сек',armor:' к броне',armorP:'% брони',aspd:'% скорости атак и чар',crit:'% шанса крита',critM:'% крит. урона',critX:'% к шансу крита',move:'% скорости бега',leech:'% вампиризма',
burnCh:'% шанса поджога',chillStr:'% силы замедления',shockCh:'% шанса шока',bleed:'% шанса кровотечения',chainAdd:' к перескокам молнии',pierce:' к пронзанию',projAdd:' снарядов',poisonDur:'% длит. яда',spreadPoison:' распространение яда',execute:'% урона по раненым',slamR:'% области ударов о землю',
stunCh:'% шанса оглушения',reflect:'% отражения урона',dmgTaken:'% получаемого урона',auraP:'% силы аур',dashCd:'% скорости перезарядки рывка',skillLvl:' к уровню всех умений',gold:'% золота',rarity:'% редкости добычи',cdr:'% скорости перезарядки',bloodMagic:''};

/* ===== МОНСТРЫ ===== */
export const MON={
minion:{n:'Скелет-раб',model:'skeleton_minion',hp:15,dmg:5,spd:3.8,range:1.5,cd:1.1,xp:.8,w:[['handslot.r','Skeleton_Blade']],atk:'1H_Melee_Attack_Chop',run:'Running_B',rs:3.8,sk:1},
warrior:{n:'Скелет-воин',model:'skeleton_warrior',hp:26,dmg:7,spd:2.6,range:1.7,cd:1.4,xp:1.1,w:[['handslot.r','Skeleton_Axe'],['handslot.l','Skeleton_Shield_Small_A']],atk:'1H_Melee_Attack_Chop',run:'Running_B',rs:4,sk:1},
archer:{n:'Скелет-арбалетчик',model:'skeleton_rogue',hp:17,dmg:6,spd:2.7,range:10,cd:2,xp:1.1,ranged:'bolt',w:[['handslot.r','Skeleton_Crossbow']],atk:'1H_Ranged_Shoot',run:'Running_B',rs:4,sk:1},
skmage:{n:'Скелет-колдун',model:'skeleton_mage',hp:19,dmg:8,spd:2.3,range:11,cd:2.5,xp:1.3,ranged:'orb',w:[['handslot.r','Skeleton_Staff']],atk:'Spellcast_Shoot',run:'Walking_A',rs:2.2,sk:1},
brute:{n:'Костяной громила',model:'skeleton_warrior',hp:70,dmg:14,spd:2,range:2.3,cd:2.1,xp:2.5,sc:1.5,tint:'#9a9088',w:[['handslot.r','Skeleton_Axe'],['handslot.l','Skeleton_Shield_Large_A']],atk:'2H_Melee_Attack_Chop',run:'Walking_D_Skeletons',rs:1.6,sk:1},
necro:{n:'Некромант',model:'skeleton_mage',hp:30,dmg:7,spd:2.2,range:10,cd:2.8,xp:2,sc:1.15,tint:'#c8a0ff',ranged:'orb',summoner:1,w:[['handslot.r','Skeleton_Staff']],atk:'Spellcast_Shoot',run:'Walking_A',rs:2.2,sk:1},
cultist:{n:'Культист',model:'merchant',hp:20,dmg:6,spd:3,range:9,cd:1.8,xp:1.2,ranged:'knife',tint:'#8a5aa8',show:['Knife'],atk:'Throw',run:'Running_A',rs:5,hum:1},
berserker:{n:'Берсерк Тлена',model:'barbarian',hp:32,dmg:9,spd:3.6,range:1.9,cd:1.2,xp:1.5,tint:'#a04a3a',show:['2H_Axe'],atk:'2H_Melee_Attack_Chop',run:'Running_A',rs:5,hum:1},
fallen:{n:'Павший рыцарь',model:'knight',hp:55,dmg:10,spd:2.3,range:1.9,cd:1.6,xp:2,tint:'#6a6a80',show:['1H_Sword','Spike_Shield','Knight_Helmet'],atk:'1H_Melee_Attack_Slice_Diagonal',run:'Walking_B',rs:2.4,block:.3,hum:1}};
export const RAREMODS=[{k:'fast',n:'Быстрый'},{k:'tough',n:'Каменный'},{k:'fiery',n:'Огненный'},{k:'vamp',n:'Вампир'},{k:'summon',n:'Повелитель'},{k:'frost',n:'Ледяной'},{k:'volatile',n:'Взрывной'},{k:'thorns',n:'Шипастый'}];

export const THEMES=[
{g:['#2b3524','#3a4a2a','#1b2216'],grass:'#5d7a36',gn:9000,fog:'#16211c',fd:.034,moon:'#a8d8b8',mi:3,hs:'#5a8070',tint:'#a8c8a0',eyes:'#5aff8a',light:'lantern_standing',
 dec:[['tree_dead_large',3],['tree_dead_medium',3],['tree_dead_small',2],['rock_single_C',1.5],['rock_single_E',1.5],['gravemarker_A',1],['post_skull',.8],['ribcage',1],['bone_A',1.5],['bone_B',1],['skull',1],['pumpkin_orange_jackolantern',.4]],bord:['tree_dead_large','rock_single_E','tree_dead_medium'],water:1},
{g:['#35343c','#45434c','#24232a'],grass:'#5a6248',gn:4500,fog:'#181922',fd:.03,moon:'#aab8ff',mi:3.2,hs:'#6070a0',tint:'#ffffff',eyes:'#6ab0ff',light:'lantern_standing',
 dec:[['gravestone',3],['grave_A',2],['grave_B',2],['gravemarker_A',1.5],['gravemarker_B',1.5],['coffin',1],['pillar',1],['skull_candle',1.2],['bench_decorated',.4],['tree_dead_medium',2],['shrine',.5],['crypt',.25],['arch',.3],['fence',1],['fence_seperate_broken',.8]],bord:['crypt','tree_dead_large','pillar','rock_single_E']},
{g:['#3a2a21','#4c3224','#22150e'],grass:'#7a4a24',gn:3500,fog:'#2a1410',fd:.03,moon:'#ffae7a',mi:3,hs:'#a05a40',tint:'#ffb090',eyes:'#ff7a2a',light:'lantern_standing',embers:1,
 dec:[['tree_pine_orange_medium',4],['tree_pine_yellow_medium',2],['tree_dead_large',2],['rock_single_E',1.5],['rock_single_D',1],['pumpkin_orange_jackolantern',.8],['skull',1],['ribcage',.8],['tent',.3]],bord:['tree_pine_orange_medium','tree_pine_yellow_medium','rock_single_E']},
{g:['#37323f','#433d4c','#26222c'],tiles:'#1d1a22',grass:null,gn:0,fog:'#150f1d',fd:.03,moon:'#c09aff',mi:3,hs:'#7050a0',tint:'#c8a0ff',eyes:'#d05aff',light:'torch_lit',
 dec:[['pillar_decorated',2],['column',2],['rubble_large',.8],['rubble_half',1],['wall_half',1],['wall_broken',.8],['barrel_large',1],['keg',.8],['box_large',1],['table_long_decorated_A',.5],['sword_shield_broken',1],['d_candle_triple',1],['coffin',.8],['banner_patternA_red',.6]],bord:['wall_broken','rubble_large','pillar_decorated','wall_half']}];

export const ZONES=[
{n:'Гнилые топи',th:0,mons:[['minion',3],['warrior',3],['archer',2]],boss:'Утопленник Морг',bt:'warrior',obj:{t:'nests',n:'Выжги гнилые гнёзда',c:3},kit:['slam','pools','summon'],lore:'Под бронёй Морга медальон с гербом. Твоим гербом. Кто-то из твоего рода уже бывал в этих землях.'},
{n:'Забытое кладбище',th:1,mons:[['minion',2],['warrior',3],['archer',2],['skmage',2]],boss:'Костяной Регент',bt:'skmage',obj:{t:'altars',n:'Зажги погребальные огни',c:3},kit:['barrage','teleport','summon','spiral'],lore:'На надгробии Регента выбито твоё имя. А рядом дата смерти: через три дня.'},
{n:'Лагерь культистов',th:2,mons:[['cultist',3],['berserker',2],['minion',2]],boss:'Верховный жрец Иссар',bt:'cultist',obj:{t:'rescue',n:'Освободи пленников',c:3},kit:['meteors','teleport','barrage','summon'],lore:'Жрец смеялся, умирая: «Мы лишь открыли дверь. Вошёл в неё ты».'},
{n:'Пепельный лес',th:2,mons:[['berserker',3],['warrior',2],['brute',1],['archer',2]],boss:'Пепельный Зверь',bt:'berserker',obj:{t:'hunt',n:'Убей вожаков стаи',c:3},kit:['charge','spin','slam','enrage'],lore:'Умирая, Пепельный Зверь прошептал: «Ты сам открыл врата. Просто не помнишь этого».'},
{n:'Склеп Забытых',th:1,mons:[['skmage',2],['necro',1],['warrior',2],['fallen',1.5]],boss:'Некромант Ордис',bt:'necro',obj:{t:'relics',n:'Собери фрагменты печати',c:4},kit:['summon','pools','spiral','nova'],lore:'В склепе Ордиса нашлась твоя книга заклинаний. Её страницы исписаны твоим почерком.'},
{n:'Затопленные руины',th:0,mons:[['fallen',2],['cultist',2],['brute',1],['minion',2]],boss:'Падший паладин Арден',bt:'fallen',obj:{t:'defend',n:'Удержи священный огонь',c:45},kit:['charge','slam','nova','barrage'],lore:'Арден узнал тебя: «Командир? Ты вернулся… но зачем ты привёл их с собой?»'},
{n:'Чертоги Тлена',th:3,mons:[['fallen',2],['skmage',2],['berserker',2],['necro',1]],boss:'Хранитель Чертогов',bt:'brute',obj:{t:'totems',n:'Разрушь обелиски Стража',c:4},kit:['slam','meteors','spin'],lore:'На стенах чертогов — фрески. На каждой изображён ты, на коленях перед светом.'},
{n:'Сердце Тлена',th:3,mons:[['fallen',2],['necro',1.5],['berserker',2],['brute',1.5],['archer',1]],boss:'Сердце Тлена',bt:'fallen',obj:{t:'altars',n:'Зажги огни очищения',c:3},kit:['barrage','slam','spiral','summon','teleport','meteors','nova','enrage'],phases:1,lore:'Сердце Тлена бьётся в такт твоему. Ты и есть его ключ. Кампания окончена — открыты бесконечные карты Кошмара.'}];
export const MAPMODS=[{k:'mdmg',n:'Монстры наносят +30% урона',q:15},{k:'mhp',n:'Монстры получают +40% здоровья',q:15},{k:'mspd',n:'Монстры на 25% быстрее',q:12},{k:'pack',n:'+40% монстров',q:25},{k:'rare',n:'Вдвое больше редких монстров',q:20},{k:'noregen',n:'Нет восстановления здоровья',q:18},{k:'chill',n:'Земля замедляет на 15%',q:10}];

export const OBJ_POOL=[{t:'nests',n:'Выжги гнёзда Кошмара',c:3},{t:'altars',n:'Зажги огни',c:3},{t:'rescue',n:'Освободи пленников',c:3},{t:'hunt',n:'Убей вожаков',c:3},{t:'relics',n:'Собери фрагменты',c:4},{t:'defend',n:'Удержи огонь',c:40},{t:'totems',n:'Разрушь обелиски',c:4}];
export const BOSS_SK={slam:'Сокрушающий удар',pools:'Ядовитые лужи',summon:'Призыв слуг',barrage:'Веер снарядов',teleport:'Шаг сквозь тень',spiral:'Спираль смерти',meteors:'Дождь огня',charge:'Таранный рывок',spin:'Вихрь клинков',nova:'Ударная волна',enrage:'Ярость'};

UNIQUES.push(
{n:'Глаз Атласа',slot:'amulet',base:'Талисман',st:{rarity:40,gold:40,dmgP:10},lore:'Кто видел все карты — видит и сокровища.'},
{n:'Пасть бездны',slot:'gloves',base:'Перчатки',st:{chaosP:35,leech:2,poisonDur:40},lore:'Она голодна всегда.'},
{n:'Терновый венец',slot:'helmet',base:'Шлем',st:{reflect:40,armorP:30,regen:4},lore:'Боль возвращается к тому, кто её принёс.'},
{n:'Вечный огонь',slot:'chest',base:'Мантия',st:{fireP:50,manaP:30,burnCh:30,hp:-20},lore:'Тот, кто стал пламенем, не боится холода.'},
{n:'Поступь великана',slot:'boots',base:'Поножи',st:{slamR:40,hp:50,move:-5,stunCh:10},lore:'От каждого шага дрожит земля.'},
{n:'Кольцо тысячи стрел',slot:'ring',base:'Кольцо',st:{projAdd:1,projP:25,aspd:6},lore:'Небо темнеет от стрел.'},
{n:'Петля времени',slot:'ring',base:'Перстень',st:{cdr:30,manaRegen:5,dmgP:-10},lore:'Ещё раз. И ещё.'},
{n:'Последний вздох',slot:'amulet',base:'Амулет',st:{execute:60,crit:4,critM:30},lore:'Добей. Не оставляй шанса.'},
{n:'Кромсатель',slot:'weapon',wb:'axe',st:{bleed:40,aspd:15,physP:35},lore:'Каждый взмах оставляет след.'},
{n:'Посох вечной зимы',slot:'weapon',wb:'staff',st:{coldP:60,chillStr:60,aoeP:20},lore:'Здесь всегда январь.'},
{n:'Миротворец',slot:'weapon',wb:'gsword',st:{meleeP:45,auraP:30,hpP:10},lore:'Мир наступает после последнего удара.'},
{n:'Ураган',slot:'weapon',wb:'hxbow',st:{pierce:3,projP:40,move:8},lore:'Он проходит сквозь строй.'});
