Now in early development phase!

# fudebako
A GTK4 (GJS) based desktop shells

## installation

from AUR

```sh
yay -Sy fudebako-git
```

or manually

```sh
git clone --depth=1 https://github.com/mcbeeringi/fudebako
cd fudebako
makepkg -si
cd ..
rm fudebako
```

## usage

```sh
fdbk-menu
```

to show desktop apps

## Nix
### run
Run without installing.
```sh
nix run github:McbeEringi/fudebako#
```

### development
You can launch a development shell with gjs etc. prepared using the following command.
```sh
nix develop
```
example
```sh
$ ./fdbk-menu # failed
/usr/bin/env: 'gjs': No such file or directory
$ nix develop
$ ./fdbk-menu # success
```

