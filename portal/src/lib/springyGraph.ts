/**
 * Heavily based on: https://github.com/dhotson/springy/
 *
 * Modifications:
 * Updated to modern TypeScript
 *
 * The original license of the inpiring code is included below.
 *
 * Springy v2.7.1
 *
 * Copyright (c) 2010-2013 Dennis Hotson
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
// ISSUE: #1105 Using a physics simulation for our graph is overkill and slow. Redoing this would be optimal.

/* eslint-disable @typescript-eslint/no-namespace */
export namespace Springy {
  export type NodeData = {
    mass?: number;
    label?: string;
    static?: Physics.Vector; // static position
  };

  export type Node = {
    id: string;
    data?: NodeData;
  };

  export type EdgeData = {
    length?: number;
    type?: unknown;
  };

  export type Edge = {
    id: number;
    source: Node;
    target: Node;
    directed?: boolean;
    data?: EdgeData;
  };

  export class Graph {
    nodeSet: Map<string, Node>;
    nodes: Node[];
    edges: Edge[];
    adjacency: Map<string, Map<string, Edge[]>>;

    nextEdgeId: number;
    eventListeners: ((g: Graph) => void)[];

    constructor() {
      this.nodeSet = new Map();
      this.nodes = [];
      this.edges = [];
      this.adjacency = new Map();

      this.nextEdgeId = 0;
      this.eventListeners = [];
    }

    addNode(node: Node): Node {
      if (!this.nodeSet.has(node.id)) {
        this.nodes.push(node);
      }

      this.nodeSet.set(node.id, node);

      this.notify();
      return node;
    }

    addNodes(args: string[]) {
      // accepts variable number of arguments, where each argument
      // is a string that becomes both node identifier and label
      for (let i = 0; i < args.length; i++) {
        const name = args[i];
        const node: Node = { id: name, data: { label: name } };
        this.addNode(node);
      }
    }

    addNodeData(id: string, data: NodeData) {
      const node = this.nodeSet.get(id);
      if (node) {
        node.data = data;
      }
    }

    addEdge(edge: Edge): Edge {
      let exists = false;
      this.edges.forEach(function (e) {
        if (edge.id === e.id) {
          exists = true;
        }
      });

      if (!exists) {
        this.edges.push(edge);
      }

      if (!this.adjacency.has(edge.source.id)) {
        this.adjacency.set(edge.source.id, new Map());
      }
      if (!this.adjacency.get(edge.source.id)?.has(edge.target.id)) {
        this.adjacency.get(edge.source.id)?.set(edge.target.id, []);
      }

      exists = false;
      this.adjacency
        .get(edge.source.id)
        ?.get(edge.target.id)
        ?.forEach((e) => {
          if (edge.id === e.id) {
            exists = true;
          }
        });

      if (!exists) {
        this.adjacency.get(edge.source.id)?.get(edge.target.id)?.push(edge);
      }

      this.notify();
      return edge;
    }

    addEdges(args: { source: string; target: string; data?: EdgeData }[]) {
      for (let i = 0; i < args.length; i++) {
        const e = args[i];
        const node1 = this.nodeSet.get(e.source);
        if (!node1) {
          throw new TypeError('invalid node name: "' + e.source + '" (source)');
        }
        const node2 = this.nodeSet.get(e.target);
        if (!node2) {
          throw new TypeError('invalid node name: "' + e.target + '" (target)');
        }

        this.newEdge(node1, node2, e.data);
      }
    }

    newNode(id: string, data?: NodeData): Node {
      return this.addNode({ id: id, data: data });
    }

    newEdge(source: Node, target: Node, data?: EdgeData) {
      return this.addEdge({ id: this.nextEdgeId++, source: source, target: target, data: data });
    }

    /**
     * add nodes and edges from JSON object
     *
     * Springy's simple JSON format for graphs.
     *
     * historically, Springy uses separate lists of nodes and edges:
     *
     * {
     *  "nodes": [
     *      "center",
     *      "left",
     *      "right",
     *      "up",
     *      "satellite"
     *    ],
     *    "edges": [
     *      ["center", "left"],
     *      ["center", "right"],
     *      ["center", "up"]
     *    ]
     *  }
     *
     **/
    loadJSON(json: string | { nodes: string[]; edges: string[][] }) {
      const obj = typeof json === 'string' ? JSON.parse(json) : json;

      if ('nodes' in obj || 'edges' in obj) {
        this.addNodes(obj.nodes);
        this.addEdges(
          obj.edges.map((e: string[]) => {
            return {
              source: e[0],
              target: e[1]
            };
          })
        );
      }
    }

    /** find the edges from node1 to node2 */
    getEdges(node1: Node, node2: Node): Edge[] {
      return this.adjacency.get(node1.id)?.get(node2.id) ?? [];
    }

    /** remove a node and its associated edges from the graph */
    removeNode(node: Node) {
      if (this.nodeSet.has(node.id)) {
        this.nodeSet.delete(node.id);
      }

      for (let i = this.nodes.length - 1; i >= 0; i--) {
        if (this.nodes[i].id === node.id) {
          this.nodes.splice(i, 1);
        }
      }

      this.detachNode(node);
    }

    /** removes edges associated with a given node */
    detachNode(node: Node) {
      const tmpEdges = this.edges.slice();
      tmpEdges.forEach((e) => {
        if (e.source.id === node.id || e.target.id === node.id) {
          this.removeEdge(e);
        }
      });

      this.notify();
    }

    /** remove a node and it's associated edges from the graph */
    removeEdge(edge: Edge) {
      for (let i = this.edges.length - 1; i >= 0; i--) {
        if (this.edges[i].id === edge.id) {
          this.edges.splice(i, 1);
        }
      }

      this.adjacency.entries().forEach(([x, values]) => {
        values.keys().forEach((y) => {
          const edges = this.adjacency.get(x)!.get(y)!;
          for (let j = edges.length - 1; j >= 0; j--) {
            if (edges[j].id === edge.id) {
              edges.splice(j, 1);
            }
          }

          if (!this.adjacency.get(x)?.get(y)?.length) {
            this.adjacency.get(x)?.delete(y);
          }
        });
        if (!this.adjacency.get(x)?.size) {
          this.adjacency.delete(x);
        }
      });

      this.notify();
    }

    /** Merge a list of nodes and edges into the current graph. eg. */
    merge(data: { nodes: Node[]; edges: Edge[] }) {
      const nodes: Map<string, Node> = new Map();
      data.nodes.forEach((n) => {
        nodes.set(n.id, this.addNode({ id: n.id, data: n.data }));
      });

      data.edges.forEach((e) => {
        const from = nodes.get(e.source.id);
        const to = nodes.get(e.target.id);
        if (!from) {
          throw new TypeError('invalid node name: "' + e.source.id + '" (source)');
        }
        if (!to) {
          throw new TypeError('invalid node name: "' + e.target.id + '" (target)');
        }
        this.addEdge({
          id: this.nextEdgeId++,
          source: from,
          target: to,
          data: e.data
        });
      }, this);
    }

    /** Remove node if filter returns true */
    filterNodes(filter: (node: Node) => boolean) {
      const tmpNodes = this.nodes.slice();
      tmpNodes.forEach((n) => {
        if (!filter(n)) {
          this.removeNode(n);
        }
      });
    }

    /** Remove edge if filter returns true */
    filterEdges(filter: (edge: Edge) => boolean) {
      const tmpEdges = this.edges.slice();
      tmpEdges.forEach((e) => {
        if (!filter(e)) {
          this.removeEdge(e);
        }
      });
    }

    subscribe(cb: (graph?: Graph) => void) {
      this.eventListeners.push(cb);
    }

    notify() {
      this.eventListeners.forEach((cb) => {
        cb(this);
      });
    }
  }

  export namespace Physics {
    export class Vector {
      x: number;
      y: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
      }
      add(v2: Vector) {
        return new Vector(this.x + v2.x, this.y + v2.y);
      }

      subtract(v2: Vector) {
        return new Vector(this.x - v2.x, this.y - v2.y);
      }

      multiply(n: number) {
        return new Vector(this.x * n, this.y * n);
      }

      divide(n: number) {
        return new Vector(this.x / n || 0, this.y / n || 0); // Avoid divide by zero errors..
      }

      magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      }

      normal() {
        return new Vector(-this.y, this.x);
      }

      normalise() {
        return this.divide(this.magnitude());
      }

      static random() {
        return new Vector(10.0 * (Math.random() - 0.5), 10.0 * (Math.random() - 0.5));
      }

      translateToScreenSpace(offset: Vector, scale: number | Vector) {
        const sx = typeof scale === 'number' ? scale : scale.x;
        const sy = typeof scale === 'number' ? scale : scale.y;
        return new Vector(offset.x + this.x * sx, offset.y + this.y * sy);
      }
    }

    export class Point {
      p: Vector; // position
      m: number; // mass
      v: Vector; // velocity
      a: Vector; // acceleration
      fixed: boolean;

      constructor(position: Vector, mass: number, fixed: boolean = false) {
        this.p = position; // position
        this.m = mass; // mass
        this.v = new Vector(0, 0); // velocity
        this.a = new Vector(0, 0); // acceleration
        this.fixed = fixed;
      }

      applyForce(force: Vector) {
        if (this.fixed) return; // don't apply force if fixed
        this.a = this.a.add(force.divide(this.m));
      }
    }

    export class Spring {
      point1: Point;
      point2: Point;
      length: number; // spring length at rest
      k: number; // spring constant (See Hooke's law) .. how stiff the spring is

      constructor(point1: Point, point2: Point, length: number, k: number) {
        this.point1 = point1;
        this.point2 = point2;
        this.length = length; // spring length at rest
        this.k = k; // spring constant (See Hooke's law) .. how stiff the spring is
      }

      distanceToPoint(point: Point) {
        // hardcore vector arithmetic.. ohh yeah!
        // .. see http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment/865080#865080
        const n = this.point2.p.subtract(this.point1.p).normalise().normal();
        const ac = point.p.subtract(this.point1.p);
        return Math.abs(ac.x * n.x + ac.y * n.y);
      }
    }
  }

  export class Layout {
    graph: Graph;
    _started: boolean = false;
    _stop: boolean = false;
    /** keep track of points associated with nodes */
    nodePoints: Map<string, Physics.Point>;
    /** keep track of springs associated with edges */
    edgeSprings: Map<number, Physics.Spring>;
    /** spring stiffness constant */
    stiffness: number;

    constructor(graph: Graph, stiffness: number) {
      this.graph = graph;

      this.nodePoints = new Map();
      this.edgeSprings = new Map();
      this.stiffness = stiffness;
    }

    point(node: Node) {
      if (!this.nodePoints.has(node.id)) {
        const mass = node.data?.mass !== undefined ? node.data.mass : 1.0;
        this.nodePoints.set(
          node.id,
          new Physics.Point(
            node.data?.static ? node.data.static : Physics.Vector.random(),
            mass,
            node.data?.static !== undefined
          )
        );
      }

      return this.nodePoints.get(node.id)!;
    }

    spring(edge: Edge) {
      if (!this.edgeSprings.has(edge.id)) {
        const length = edge.data?.length !== undefined ? edge.data.length : 1.0;

        let existingSpring: Physics.Spring | undefined;

        const from = this.graph.getEdges(edge.source, edge.target);
        from.forEach((e) => {
          if (!existingSpring && this.edgeSprings.has(edge.id)) {
            existingSpring = this.edgeSprings.get(e.id)!;
            return new Physics.Spring(existingSpring.point1, existingSpring.point2, 0.0, 0.0);
          }
        });

        const to = this.graph.getEdges(edge.target, edge.source);
        to.forEach((e) => {
          if (!existingSpring && this.edgeSprings.has(e.id)) {
            existingSpring = this.edgeSprings.get(e.id)!;
            return new Physics.Spring(existingSpring.point2, existingSpring.point1, 0.0, 0.0);
          }
        });

        this.edgeSprings.set(
          edge.id,
          new Physics.Spring(
            this.point(edge.source),
            this.point(edge.target),
            length,
            this.stiffness
          )
        );
      }

      return this.edgeSprings.get(edge.id)!;
    }

    eachNode(callback: (node: Node, point: Physics.Point) => void) {
      this.graph.nodes.forEach((n) => {
        callback.call(this, n, this.point(n));
      });
    }

    eachEdge(callback: (edge: Edge, spring: Physics.Spring) => void) {
      this.graph.edges.forEach((e) => {
        callback.call(this, e, this.spring(e));
      });
    }

    eachSpring(callback: (spring: Physics.Spring) => void) {
      this.graph.edges.forEach((e) => {
        callback.call(this, this.spring(e));
      });
    }

    /**
     * Start simulation if it's not running already.
     * In case it's running then the call is ignored, and none of the callbacks passed is ever executed.
     */
    start(
      render?: () => void,
      onRenderStop?: () => void,
      onRenderStart?: () => void,
      tick?: () => void,
      stopCondition?: () => boolean
    ) {
      if (this._started) return;
      this._started = true;
      this._stop = false;

      if (onRenderStart) {
        onRenderStart();
      }

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const t = this;
      requestAnimationFrame(function step() {
        if (tick) {
          tick();
        }

        if (render) {
          render();
        }

        // stop simulation when energy of the system goes below a threshold
        if (t._stop || (stopCondition && stopCondition())) {
          t._started = false;
          if (onRenderStop) {
            onRenderStop();
          }
        } else {
          requestAnimationFrame(step);
        }
      });
    }

    stop() {
      this._stop = true;
    }
  }

  export class ForceDirected extends Layout {
    /** repulsion constant */
    repulsion: number;
    /** velocity damping factor */
    damping: number;
    /** threshold used to determine render stop */
    minEnergyThreshold: number;
    /** nodes aren't allowed to exceed this speed */
    maxSpeed: number;

    constructor(
      graph: Graph,
      stiffness: number,
      repulsion: number,
      damping: number,
      minEnergyThreshold: number = 0.01,
      maxSpeed: number = Infinity
    ) {
      super(graph, stiffness);
      this.repulsion = repulsion;
      this.damping = damping;
      this.minEnergyThreshold = minEnergyThreshold;
      this.maxSpeed = maxSpeed;
    }

    // Physics stuff
    applyCoulombsLaw() {
      this.eachNode((n1, point1) => {
        this.eachNode((n2, point2) => {
          if (point1 !== point2) {
            const d = point1.p.subtract(point2.p);
            const distance = d.magnitude() + 0.1; // avoid massive forces at small distances (and divide by zero)
            const direction = d.normalise();

            // apply force to each end point
            point1.applyForce(direction.multiply(this.repulsion).divide(distance * distance * 0.5));
            point2.applyForce(
              direction.multiply(this.repulsion).divide(distance * distance * -0.5)
            );
          }
        });
      });
    }

    applyHookesLaw() {
      this.eachSpring((spring) => {
        const d = spring.point2.p.subtract(spring.point1.p); // the direction of the spring
        const displacement = spring.length - d.magnitude();
        const direction = d.normalise();

        // apply force to each end point
        spring.point1.applyForce(direction.multiply(spring.k * displacement * -0.5));
        spring.point2.applyForce(direction.multiply(spring.k * displacement * 0.5));
      });
    }

    attractToCentre() {
      this.eachNode((node, point) => {
        const direction = point.p.multiply(-1.0);
        point.applyForce(direction.multiply(this.repulsion / 50.0));
      });
    }

    updateVelocity(timestep: number) {
      this.eachNode((node, point) => {
        point.v = point.v.add(point.a.multiply(timestep)).multiply(this.damping);
        if (point.v.magnitude() > this.maxSpeed) {
          point.v = point.v.normalise().multiply(this.maxSpeed);
        }
        point.a = new Physics.Vector(0, 0);
      });
    }

    updatePosition(timestep: number) {
      this.eachNode((node, point) => {
        point.p = point.p.add(point.v.multiply(timestep));
      });
    }

    // Calculate the total kinetic energy of the system
    totalEnergy() {
      let energy = 0.0;
      this.eachNode(function (node, point) {
        const speed = point.v.magnitude();
        energy += 0.5 * point.m * speed * speed;
      });

      return energy;
    }

    /**
     * Start simulation if it's not running already.
     * In case it's running then the call is ignored, and none of the callbacks passed is ever executed.
     */
    start(render?: () => void, onRenderStop?: () => void, onRenderStart?: () => void) {
      super.start(
        render,
        onRenderStop,
        onRenderStart,
        () => {
          this.tick(0.03);
        },
        () => this.totalEnergy() < this.minEnergyThreshold
      );
    }

    tick(timestep: number) {
      this.applyCoulombsLaw();
      this.applyHookesLaw();
      this.attractToCentre();
      this.updateVelocity(timestep);
      this.updatePosition(timestep);
    }

    // Find the nearest point to a particular position
    nearest(pos: Physics.Vector) {
      let min: { node: Node; point: Physics.Point; distance: number } | undefined;
      this.graph.nodes.forEach((n) => {
        const point = this.point(n);
        const distance = point.p.subtract(pos).magnitude();

        if (min?.distance === undefined || distance < min.distance) {
          min = { node: n, point: point, distance: distance };
        }
      });

      return min;
    }

    getBoundingBox() {
      const bottomleft = new Physics.Vector(-2, -2);
      const topright = new Physics.Vector(2, 2);

      this.eachNode(function (n, point) {
        if (point.p.x < bottomleft.x) {
          bottomleft.x = point.p.x;
        }
        if (point.p.y < bottomleft.y) {
          bottomleft.y = point.p.y;
        }
        if (point.p.x > topright.x) {
          topright.x = point.p.x;
        }
        if (point.p.y > topright.y) {
          topright.y = point.p.y;
        }
      });

      const padding = topright.subtract(bottomleft).multiply(0.07); // ~5% padding

      return { bottomleft: bottomleft.subtract(padding), topright: topright.add(padding) };
    }
  }

  /**
   * Renderer handles the layout rendering loop
   * @param onRenderStop optional callback function that gets executed whenever rendering stops.
   * @param onRenderStart optional callback function that gets executed whenever rendering starts.
   * @param onRenderFrame optional callback function that gets executed after each frame is rendered.
   */
  export class Renderer {
    layout: Layout;
    clear: () => void;
    drawEdge: (edge: Edge, source: Physics.Vector, target: Physics.Vector) => void;
    drawNode: (node: Node, position: Physics.Vector) => void;
    onRenderStop: () => void;
    onRenderStart: () => void;
    onRenderFrame: () => void;

    constructor(
      layout: Layout,
      clear: () => void,
      drawEdge: (edge: Edge, source: Physics.Vector, target: Physics.Vector) => void,
      drawNode: (node: Node, position: Physics.Vector) => void,
      onRenderStop: () => void,
      onRenderStart: () => void,
      onRenderFrame: () => void
    ) {
      this.layout = layout;
      this.clear = clear;
      this.drawEdge = drawEdge;
      this.drawNode = drawNode;
      this.onRenderStop = onRenderStop;
      this.onRenderStart = onRenderStart;
      this.onRenderFrame = onRenderFrame;

      this.layout.graph.subscribe(() => {
        this.graphChanged();
      });
    }

    /**
     * Starts the simulation of the layout in use.
     *
     * Note that in case the algorithm is still or already running then the layout that's in use
     * might silently ignore the call, and your optional <code>done</code> callback is never executed.
     * At least the built-in ForceDirected layout behaves in this way.
     *
     * @param done An optional callback function that gets executed when the springy algorithm stops,
     * either because it ended or because stop() was called.
     */
    start(done?: () => void) {
      this.layout.start(
        () => {
          this.clear();

          this.layout.eachEdge((edge, spring) => {
            this.drawEdge(edge, spring.point1.p, spring.point2.p);
          });

          this.layout.eachNode((node, point) => {
            this.drawNode(node, point.p);
          });

          this.onRenderFrame?.();
        },
        done
          ? () => {
            this.onRenderStop();
            done();
          }
          : this.onRenderStop,
        this.onRenderStart
      );
    }

    stop() {
      this.layout.stop();
    }

    graphChanged() {
      this.start();
    }
  }
}
