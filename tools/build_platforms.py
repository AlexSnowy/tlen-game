#!/usr/bin/env python3
"""Сборка zip-пакетов «Земель Тлена» для игровых площадок.

Использование: python3 tools/build_platforms.py [площадка ...]
Без аргументов собирает все. Результат — dist/zemli-tlena-<площадка>.zip
(index.html в корне архива, как требуют площадки).

GameDistribution: перед сборкой задай GD_ID=<id игры из кабинета GD>.
"""
import os, re, shutil, subprocess, sys, time, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public')
DIST = os.path.join(ROOT, 'dist')
# площадка -> значение window.PLAT в игре
PLATS = {
    'yandex': 'yandex',      # Яндекс Игры: SDK, реклама, Game Ready
    'crazygames': 'crazy',   # CrazyGames: SDK v3
    'gamedistribution': 'gd',
    'vk': 'vk',              # Игры ВКонтакте: VK Bridge
    'itch': 'itch',          # itch.io — без рекламы
    'newgrounds': 'itch',
    'gamejolt': 'itch',
}
SKIP = {'bugs.html'}


def version():
    try:
        return subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short=12', 'HEAD']).decode().strip()
    except Exception:
        return 'local'


def build(name, plat, ver, stamp):
    out = os.path.join(DIST, name)
    shutil.rmtree(out, ignore_errors=True)
    shutil.copytree(SRC, out, ignore=lambda d, files: [f for f in files if f in SKIP])
    for fn in ('index.html', 'game.js'):
        p = os.path.join(out, fn)
        s = open(p, encoding='utf-8').read().replace('__V__', ver).replace('__T__', stamp)
        if fn == 'index.html':
            s = re.sub(r'<script src="https://telegram\.org/[^"]*"></script>\s*', '', s)
            gd = os.environ.get('GD_ID', '') if plat == 'gd' else ''
            inject = f'<script>window.PLAT={plat!r};' + (f'window.GD_ID={gd!r};' if plat == 'gd' else '') + '</script>\n'
            s = s.replace('<head>', '<head>\n' + inject, 1)
        open(p, 'w', encoding='utf-8').write(s)
    zp = os.path.join(DIST, f'zemli-tlena-{name}.zip')
    if os.path.exists(zp):
        os.remove(zp)
    n = 0
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, _, files in os.walk(out):
            for f in files:
                full = os.path.join(d, f)
                z.write(full, os.path.relpath(full, out))
                n += 1
    print(f'{name:18} {os.path.getsize(zp)/1e6:5.1f} MB  файлов: {n}')
    return zp


def main():
    names = sys.argv[1:] or list(PLATS)
    os.makedirs(DIST, exist_ok=True)
    ver, stamp = version(), str(int(time.time()))
    for n in names:
        build(n, PLATS[n], ver, stamp)


if __name__ == '__main__':
    main()
