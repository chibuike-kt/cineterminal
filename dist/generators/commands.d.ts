export interface CommandBlock {
    prompt: string;
    command: string;
    output: string[];
}
export declare function generateCommandBlock(): CommandBlock;
export declare function commandBlockToLines(block: CommandBlock): string[];
