import { SimObject } from "./SimObject";

function generateCombinations(array1: Array<SimObject>, array2: Array<SimObject>, callback: (obj1: SimObject, obj2: SimObject) => void) {
    for (var i = 0; i < array1.length; i++) {
        for (var j = 0; j < array2.length; j++) {
            var o1: SimObject = array1[i];
            var o2: SimObject = array2[j];
            if (o1 && o2 && o1 !== o2) {
                callback.call(null, o1, o2);
            }
        }
    }
}

class ProximityGrid {
    cells: Array<Array<Array<SimObject>>>;

    constructor(objects: Array<SimObject>) {
        this.cells = [];

        var maxRadius = 0;
        objects.forEach(obj => {
            maxRadius = Math.max(maxRadius, obj.radius);
        });
        const cellSize = maxRadius * 1.1;

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

                generateCombinations(cell1, cell1, callback);
                generateCombinations(cell1, cell2, callback);
                generateCombinations(cell1, cell3, callback);
                generateCombinations(cell1, cell3, callback);
            }
        }
    }
}

export { ProximityGrid };
