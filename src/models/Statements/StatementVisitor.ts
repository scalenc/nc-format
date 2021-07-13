import { Declaration } from './Declaration';
import { Assignment } from './Assignment';
import { GCode } from './GCode';
import { Goto } from './Goto';
import { Instruction } from './Instruction';
import { FlowControlInstruction } from './FlowControlInstruction';
import { MCode } from './MCode';

/// Visitor pattern.
///
/// For every statement implementation derived from the <see cref="TiStatement" /> interface,
/// a certain function exists in this class, which is called when calling the
/// <see cref="TiStatement.Visit(TiStatementVisitor)" /> function.
/// Thus, implement this interface for statement specific code.
export interface StatementVisitor {
  onDeclaration(declaration: Declaration): void;
  onAssignment(assignment: Assignment): void;
  onGCode(gCode: GCode): void;
  onGoto(gotoStatement: Goto): void;
  onInstruction(instruction: Instruction): void;
  onFlowControlInstruction(instruction: FlowControlInstruction): void;
  onMCode(mCode: MCode): void;
}
