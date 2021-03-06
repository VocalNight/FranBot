import {CommandContext} from "../context/command_context";

export class Utils {

    public checkServers(userCommand: CommandContext, argsPosition: number): string[] {
        let arrayServers: string[] = userCommand.args[argsPosition].split(',');

        if (arrayServers.length === 1) {

            switch (arrayServers[0]) {

                case "Aether": {
                    return this.getAether();
                }
                case "Chaos": {
                    return this.getChaos();
                }
                case "Elemental": {
                    return this.getElemental();
                }
                case "Gaia": {
                    return this.getGaia();
                }
                case "Mana": {
                    return this.getMana();
                }
                case "Primal": {
                    return this.getPrimal();
                }
                case "Crystal": {
                    return this.getCrystal();
                }
                case "Light": {
                    return this.getLight();
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

    public printValues(userCommand: CommandContext, array: any[]) {
        if (array.length === 0) {
            userCommand.message.channel.send("The item is either not on the market, or you typed wrong.");
            return;
        }
        let message = '```' + array.join("\n") + '```';
        userCommand.message.channel.send(message);
    }

    // get date from milliseconds and transform in day/month format
    public processDateDayMonth(purchasedDate: number): string {
        let date = new Date(purchasedDate);
        return ("0" + date.getDate()).slice(-2) + '/' + ("0" + (date.getMonth() + 1)).slice(-2)
    }

    public getItemName(name: string): string {
        return name.split('_').join(' ');
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