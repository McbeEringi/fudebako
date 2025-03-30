{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs =
    inputs@{
      nixpkgs,
      flake-parts,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.treefmt-nix.flakeModule ];
      systems = [
        "x86_64-linux"
        "x86_64-darwin"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      perSystem =
        {
          config,
          system,
          pkgs,
          ...
        }:
        {
          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              gjs
              gobject-introspection
              wrapGAppsHook4
            ];
          };
          packages.default = pkgs.stdenv.mkDerivation {
            pname = "fdbk-menu";
            name = "fudebako";
            src = ./.;
            nativeBuildInputs = with pkgs; [
              gobject-introspection
              wrapGAppsHook4
            ];
            buildInputs = with pkgs; [
              gjs
            ];
            installPhase = ''
              install -Dm755 "$src/fdbk-menu" "$out/bin/fdbk-menu"
            '';
          };
          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
            };
          };
        };
    };
}
