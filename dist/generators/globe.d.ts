export interface GlobeState {
    rotation: number;
    targetLat: number;
    targetLon: number;
    lockProgress: number;
    phase: 'rotating' | 'locking' | 'locked';
    pingPoints: Array<{
        lat: number;
        lon: number;
        age: number;
    }>;
}
export declare function createGlobeState(): GlobeState;
export declare function renderGlobe(state: GlobeState, width: number, height: number): string[];
export declare function generateCoordLine(): string;
export declare function generateSatLine(): string;
