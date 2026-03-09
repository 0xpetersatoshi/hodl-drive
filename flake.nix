{
  description = "hodl-drive development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs_24
          pnpm
          ungoogled-chromium
        ];

        shellHook = ''
          export PLAYWRIGHT_CHROMIUM_PATH="${pkgs.ungoogled-chromium}/bin/chromium"
          export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
        '';
      };
    });
}
