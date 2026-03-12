// ── AST Visitor for Code Analysis ─────────────────────────────────

// ── AST Node Types ────────────────────────────────────────────────

export interface ASTVisitor<T = void> {
  visitProgram(node: ProgramNode): T;
  visitFunctionDecl(node: FunctionDeclNode): T;
  visitVariableDecl(node: VariableDeclNode): T;
  visitCallExpression(node: CallExpressionNode): T;
  visitReturnStatement(node: ReturnStatementNode): T;
}

export interface ASTNode {
  kind: string;
  accept<T>(visitor: ASTVisitor<T>): T;
}

export class ProgramNode implements ASTNode {
  readonly kind = "Program";
  constructor(public body: ASTNode[]) {}
  accept<T>(v: ASTVisitor<T>): T { return v.visitProgram(this); }
}

export class FunctionDeclNode implements ASTNode {
  readonly kind = "FunctionDecl";
  constructor(
    public name: string,
    public params: string[],
    public body: ASTNode[],
    public isAsync: boolean = false
  ) {}
  accept<T>(v: ASTVisitor<T>): T { return v.visitFunctionDecl(this); }
}

export class VariableDeclNode implements ASTNode {
  readonly kind = "VariableDecl";
  constructor(
    public name: string,
    public kind_: "let" | "const" | "var",
    public init: ASTNode | null = null
  ) {}
  accept<T>(v: ASTVisitor<T>): T { return v.visitVariableDecl(this); }
}

export class CallExpressionNode implements ASTNode {
  readonly kind = "CallExpression";
  constructor(public callee: string, public args: ASTNode[]) {}
  accept<T>(v: ASTVisitor<T>): T { return v.visitCallExpression(this); }
}

export class ReturnStatementNode implements ASTNode {
  readonly kind = "ReturnStatement";
  constructor(public argument: ASTNode | null = null) {}
  accept<T>(v: ASTVisitor<T>): T { return v.visitReturnStatement(this); }
}

// ── Visitors ──────────────────────────────────────────────────────

export interface CodeMetrics {
  functionCount: number;
  asyncFunctionCount: number;
  variableCount: number;
  varUsageCount: number;
  callCount: number;
  returnCount: number;
}

export class MetricsVisitor implements ASTVisitor<void> {
  metrics: CodeMetrics = {
    functionCount: 0,
    asyncFunctionCount: 0,
    variableCount: 0,
    varUsageCount: 0,
    callCount: 0,
    returnCount: 0,
  };

  visitProgram(node: ProgramNode): void {
    node.body.forEach(n => n.accept(this));
  }

  visitFunctionDecl(node: FunctionDeclNode): void {
    this.metrics.functionCount++;
    if (node.isAsync) this.metrics.asyncFunctionCount++;
    node.body.forEach(n => n.accept(this));
  }

  visitVariableDecl(node: VariableDeclNode): void {
    this.metrics.variableCount++;
    if (node.kind_ === "var") this.metrics.varUsageCount++;
    node.init?.accept(this);
  }

  visitCallExpression(node: CallExpressionNode): void {
    this.metrics.callCount++;
    node.args.forEach(a => a.accept(this));
  }

  visitReturnStatement(node: ReturnStatementNode): void {
    this.metrics.returnCount++;
    node.argument?.accept(this);
  }
}

export class PrettyPrintVisitor implements ASTVisitor<string> {
  private indent = 0;

  private pad(): string { return "  ".repeat(this.indent); }

  visitProgram(node: ProgramNode): string {
    return node.body.map(n => n.accept(this)).join("\n");
  }

  visitFunctionDecl(node: FunctionDeclNode): string {
    const prefix = node.isAsync ? "async function" : "function";
    this.indent++;
    const body = node.body.map(n => n.accept(this)).join("\n");
    this.indent--;
    return `${this.pad()}${prefix} ${node.name}(${node.params.join(", ")}) {\n${body}\n${this.pad()}}`;
  }

  visitVariableDecl(node: VariableDeclNode): string {
    const init = node.init ? ` = ${node.init.accept(this)}` : "";
    return `${this.pad()}${node.kind_} ${node.name}${init};`;
  }

  visitCallExpression(node: CallExpressionNode): string {
    const args = node.args.map(a => a.accept(this)).join(", ");
    return `${node.callee}(${args})`;
  }

  visitReturnStatement(node: ReturnStatementNode): string {
    const value = node.argument ? ` ${node.argument.accept(this)}` : "";
    return `${this.pad()}return${value};`;
  }
}

