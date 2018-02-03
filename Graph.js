// Graph[0] is a list of nodes where each node is [name, open, close, duration]
// Graph[1] is an adjacency matrix where Graph[1][i][0] contains the source vertex for row i and Graph[1][i][j+1] contains the weight of the edge from i to j
var Graph = [[], []];
var maxWeight = 0;

// Add a node to the graph
function addNode(name, open, close, duration, rating) {
    // Push the node onto the node array
    // 0 - name, 1 - open time, 2 - close time, 3 - avg stay, 4 - rating, 5 - visited status, 6 - stored dist
    this.Graph[0].push([name, parseTime(open), parseTime(close), duration, rating, false, 0]);

    // Push the row for the new node onto the adjeacency matrix
    this.Graph[1].push([name]);
}

// Add an edge to the graph
function addEdge(name1, name2, weight) {
    // Check if the first name is in the list of source nodes
    for (i = 0; i < this.Graph[1].length; i++) {
        if (this.Graph[1][i][0] === name1) {
            // Check if the second name is in the list of destinations
            for (j = 0; j < this.Graph[0].length; j++) {
                if (this.Graph[0][j][0] === name2) {
                    this.Graph[1][i][j + 1] = weight;
                    if (weight > maxWeight) maxWeight = weight + this.Graph[0][j][3];
                }
            }
        }
    }
}

// Get all of the node data
function getNode(name) {
    for (j = 0; j < this.Graph[0].length; j++) {
        if (this.Graph[0][j][0] === name) {
            return this.Graph[0][j];
        }
    }
    return null;
}

function getEdge(name1, name2) {
    for (i = 0; i < this.Graph[0].length; i++) {
        if (this.Graph[0][i] === name1) {
            for (j = 0; j < this.Graph[0].length; j++) {
                if (this.Graph[0][j] === name2) {
                    if (this.Graph[1][i][j]) return this.Graph[1][i][j];
                    else break;
                }
            }
        }
    }
    return null;
}

// Get a list of the neighbor weights
function getNeighborWeights(name) {
    for (i = 0; i < this.Graph[1].length; i++) {
        if (this.Graph[1][i][0] === name) {
            var ret = [];
            for (j = 1; j < this.Graph[1][i].length; j++) {
                ret.push(Graph[1][i][j]);
            }
            return ret;
        }
    }
    return null;
}

// check if the graph is complete
function checkComplete() {
    size = this.Graph[0].length;
    if (!(size === this.Graph[1].length)) return false;
    for (i = 0; i < this.Graph[1].length; i++) {
        if (!(size === this.Graph[1][i].length - 1)) return false;
        for (j = 1; j < size + 1; j++) {
            if (!(this.Graph[1][i][j])) return false;
        }
    }
    return true;
}

function dumbPath(name1, name2) {
    return [name1, name2];
}

function parseTime(time) {
    hour = time / 100;
    minute = time % 100;
    return 60 * hour + minute;
}

// Assume times are already parsed
function isOpen(open, close, t, duration) {
    return (close < open) ? (t >= open && (t + duration) <= closed) :
        ((t >= open || t <= closed) && ((t + duration) >= open || (t + duration) <= closed));
}

function copyArrWithout(a, val) {
    retArr = [];
    for (i = 0; i < a.length; i++) {
        if (a[i] === val) continue;
        retArr.push(a[i]);
    }
    return retArr
}

// Return a list contain the nodes in the shortes path from A to B
function longPath(name1, name2, t0, tn) {
    startTime = parseTime(t0);
    endTime = parseTime(tn);

    branch(name1, name2, t0, tn, this.Graph[0])
}

function branch(name1, name2, t0, tn, list, score) {
    if (name1 === name2) return;

    newScore = score + getNode(name1)[4];
    smaller = copyArrWithout(list, name1);
    for (i = 0; i < list.length; i++) {
        elapsedTime = t0 + getEdge(name1, list[i]);
        if (elapsedTime < tn) {
            retVal = branch(list[i], name2, elapsedTime, tn, smaller);
        }
    }
}