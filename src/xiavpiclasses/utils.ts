import {CommandContext} from "../context/command_context";

export class Utils {

    public checkServers(userCommand: CommandContext, argsPosition: number): string[] {
        let arrayServers: string[] = userCommand.args[argsPosition].split(',');

        if (arrayServers.length === 1) {

            switch (arrayServers[0]) {

                case "Aether": {
                    arrayServers = this.getAether();
                    break;
                }
                case "Chaos": {
                    arrayServers = this.getChaos();
                    break;
                }
                case "Elemental": {
                    arrayServers = this.getElemental();
                    break;
                }
                case "Gaia": {
                    arrayServers = this.getGaia();
                    break;
                }
                case "Mana": {
                    arrayServers = this.getMana();
                    break;
                }
                case "Primal": {
                    arrayServers = this.getPrimal();
                    break;
                }
                case "Crystal": {
                    arrayServers = this.getCrystal();
                    break;
                }
                case "Light": {
                    arrayServers = this.getLight();
                    break;
                }
            }
        }
        return arrayServers;
    }

    public currencyFormat(num: number) {
        return num.toFixed()
            .replace('.', ',')
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    }


   private getAether(): string[] {
        return ["Adamantoise","Cactuar","Faerie","Gilgamesh","Jenova","Midgardsormr","Sargatanas","Siren"];
    }

    private getChaos(): string[] {
        return ["Cerberus","Louisoix","Moogle","Omega","Ragnarok"];
    }

    private getElemental(): string[] {
       return ["Aegis","Atomos","Carbuncle","Garuda","Gungnir","Kujata","Ramuh","Tonberry","Typhon","Unicorn"];
    }

    private getGaia(): string[] {
        return ["Alexander","Bahamut","Durandal","Fenrir","Ifrit","Ridill","Tiamat","Ultima","Valefor","Yojimbo","Zeromus"];
    }

    private getMana(): string[] {
        return ["Anima","Asura","Belias","Chocobo","Hades","Ixion","Mandragora","Masamune","Pandaemonium","Shinryu","Titan"];
    }

    private getPrimal(): string[] {
        return ["Behemoth", "Excalibur","Exodus","Famfrit","Hyperion","Lamia","Leviathan","Ultros"];
    }

    private getCrystal(): string[] {
        return ["Balmung", "Brynhildr", "Coeurl", "Diabolos", "Goblin", "Malboro", "Mateus", "Zalera"];
    }

    private getLight(): string[] {
        return ["Lich", "Odin", "Phoenix", "Shiva", "Zodiark"];
    }
}