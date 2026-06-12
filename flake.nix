{
  description = "Car-words — Three.js vocabulary driving game for toddlers (Vite dev environment)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            bun
            just
          ];
          shellHook = ''
            echo "Car-words dev shell ready. Run: just install && just dev"
          '';
        };
      });
}
