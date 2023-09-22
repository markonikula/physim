import { SimObject } from "./SimObject";
import { Logger } from './Logger.js';
import { SimData } from "./SimData";

const NAIVE_IMPL = false;
const EMPTY_ARRAY = [];
const logger = new Logger();

console.log("Using naive proximity impl: " + NAIVE_IMPL);

function generateCombinations(array1: Array<number>, array2: Array<number>, callback: (obj1: number, obj2: number) => void): number {
    if (!array1 || !array2) return 0;
    var count = 0;
    if (array1 === array2) {
        const n = array1.length;
        for (var i = 0; i < n - 1; i++) {
            for (var j = i + 1; j < n; j++) {
                callback(array1[i], array1[j]);
                count++;
            }
        }
    } else {
        for (var i = 0; i < array1.length; i++) {
            for (var j = 0; j < array2.length; j++) {
                var o1 = array1[i];
                var o2 = array2[j];
                if (o1 !== o2) {
                    callback(o1, o2);
                    count++;
                }
            }
        }
    }
    return count;
}

function getCell(cells: Array<Array<Array<Array<number>>>>, x: number, y: number, z: number): Array<number> {
    const a1 = cells[x];
    if (!a1) return null;
    const a2 = a1[y];
    if (!a2) return null;
    const a3 = a2[z];
    return a3;
}

class ProximityGrid {
    cells: Array<Array<Array<Array<number>>>>;
    objects: SimData;

    constructor(objects: SimData, cellFactor: number) {
        this.cells = [];
        this.objects = objects;

        var maxRadius = 0;
        objects.forEach(obj => {
            maxRadius = Math.max(maxRadius, obj.radius);
        });
        const cellSize = maxRadius * cellFactor;

        objects.forEach((data, index) => {
            const xCell = Math.floor(data.getX(index) / cellSize);
            const yCell = Math.floor(data.getY(index) / cellSize);
            const zCell = Math.floor(data.getZ(index) / cellSize);
            var xxx = (this.cells[xCell] ||= []);
            var yyy = (xxx[yCell] ||= []);
            var zzz = (yyy[zCell] ||= []);
            zzz.push(index);
        });
    }

    forEach(callback: (index: number) => void) {
        const xLen = this.cells.length;
        for (var x = 0; x < xLen; x++) {
            const xxx = this.cells[x] || [];
            const yLen = xxx.length;
            for (var y = 0; y < yLen; y++) {
                const yyy = xxx[y] || [];
                const zLen = yyy.length;
                for (var z = 0; z < zLen; z++) {
                    const zzz = yyy[z];
                    if (!zzz) continue;
                    zzz.forEach(callback);
                }
            }
        }
    }

    forEachCandidatePair(callback: (obj1: number, obj2: number) => void) {
        //if (NAIVE_IMPL) {
        //    generateCombinations(this.objects, this.objects, callback);
        //    return;
        //}
        var nonEmptyCellCount = 0;
        var pairCount = 0;
        const xLen = this.cells.length;
        for (var x = 0; x < xLen; x++) {
            const xxx = this.cells[x] || [];
            const yLen = xxx.length;
            for (var y = 0; y < yLen; y++) {
                const yyy = xxx[y] || [];
                const zLen = yyy.length;
                for (var z = 0; z < zLen; z++) {
                    const zzz = yyy[z];
                    if (!zzz) continue;

                    nonEmptyCellCount++;

                    // In 3d, each cell has 26 neighbours (3*3*3-1 = 26).
                    // We cover half of them here, the other half are considered "from the other side".

                    pairCount += generateCombinations(zzz, zzz, callback);
                    pairCount += generateCombinations(zzz, getCell(this.cells, x, y, z), callback);
                    pairCount += generateCombinations(zzz, getCell(this.cells, x, y + 1, z), callback);
                    pairCount += generateCombinations(zzz, getCell(this.cells, x + 1, y, z), callback);
                    pairCount += generateCombinations(zzz, getCell(this.cells, x + 1, y + 1, z), callback);
                    pairCount += generateCombinations(zzz, getCell(this.cells, x + 1, y - 1, z), callback);

                    for (var i = -1; i <= 1; i++) {
                        for (var j = -1; j <= 1; j++) {
                            pairCount += generateCombinations(zzz, getCell(this.cells, x + i, y + j, z + 1), callback);
                        }
                    }
                }
            }
        }

        logger.log(`  Found ${nonEmptyCellCount} non-empty cells in the proximity grid, producing ${pairCount} pairs`);
    }
}

export { ProximityGrid };
