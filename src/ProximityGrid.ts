import { SimObject } from "./SimObject";

const NAIVE_IMPL = false;

function generateCombinations(array1: Array<SimObject>, array2: Array<SimObject>, callback: (obj1: SimObject, obj2: SimObject) => void) {
    if (array1 === array2) {
        const n = array1.length;
        for (var i = 0; i < n - 1; i++) {
            for (var j = i + 1; j < n; j++) {
                callback(array1[i], array1[j]);
            }
        }
    } else {
        for (var i = 0; i < array1.length; i++) {
            for (var j = 0; j < array2.length; j++) {
                var o1 = array1[i];
                var o2 = array2[j];
                if (o1 && o2 && o1 !== o2) {
                    callback(o1, o2);
                }
            }
        }
    }
}

class ProximityGrid {
    cells: Array<Array<Array<SimObject>>>;
    objects: Array<SimObject>;

    constructor(objects: Array<SimObject>) {
        this.cells = [];
        this.objects = objects;

        var maxRadius = 0;
        objects.forEach(obj => {
            maxRadius = Math.max(maxRadius, obj.radius);
        });
        const cellSize = maxRadius * 2.01;

        objects.forEach(obj => {
            const xCell = Math.floor(obj.position.x / cellSize);
            const yCell = Math.floor(obj.position.y / cellSize);
            var cell = this.cells[xCell];
            if (cell === undefined) {
                cell = [];
                this.cells[xCell] = cell;
            }
            cell[yCell] ||= [];
            cell[yCell].push(obj);
        });
    }

    forEachCandidatePair(callback: (obj1: SimObject, obj2: SimObject) => void) {
        if (NAIVE_IMPL) {
            generateCombinations(this.objects, this.objects, callback);
            return;
        }
        const xLen = this.cells.length;
        for (var x = 0; x < xLen; x++) {
            const row1 = this.cells[x] || [];
            const row2 = this.cells[x + 1] || [];
            const yLen = row1.length;
            for (var y = 0; y < yLen; y++) {
                const cell1 = row1[y] || [];
                const cell2 = row1[y + 1] || [];
                const cell3 = row2[y] || [];
                const cell4 = row2[y + 1] || [];
                const cell5 = row2[y - 1] || [];

                generateCombinations(cell1, cell1, callback);
                generateCombinations(cell1, cell2, callback);
                generateCombinations(cell1, cell3, callback);
                generateCombinations(cell1, cell4, callback);
                generateCombinations(cell1, cell5, callback);
            }
        }
    }
}

export { ProximityGrid };
