import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

function createMockExecutionContext(user: any): ExecutionContext {
  const request = { user };
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function runRbacTests() {
  console.log('🧪 Starting RBAC Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const reflector = new Reflector();
  const rolesGuard = new RolesGuard(reflector);

  // Test 1: Public route with no roles required should allow access
  try {
    reflector.getAllAndOverride = () => undefined;
    const context = createMockExecutionContext(null);
    const result = rolesGuard.canActivate(context);
    assert(result === true, 'Public route without roles allowed access');
  } catch (err: any) {
    assert(false, `Public route failed with error: ${err.message}`);
  }

  // Test 2: Unauthenticated user accessing protected route throws ForbiddenException
  try {
    reflector.getAllAndOverride = () => [Role.ADMIN];
    const context = createMockExecutionContext(null);
    rolesGuard.canActivate(context);
    assert(false, 'Unauthenticated user should be denied');
  } catch (err: any) {
    assert(
      err instanceof ForbiddenException,
      'Unauthenticated request throws ForbiddenException',
    );
  }

  // Test 3: Admin user accessing ADMIN route is granted access
  try {
    reflector.getAllAndOverride = () => [Role.ADMIN];
    const context = createMockExecutionContext({ role: Role.ADMIN, email: 'admin@example.com' });
    const result = rolesGuard.canActivate(context);
    assert(result === true, 'ADMIN role is granted access to ADMIN-only route');
  } catch (err: any) {
    assert(false, `Admin access failed with error: ${err.message}`);
  }

  // Test 4: Team member attempting to access ADMIN route is denied
  try {
    reflector.getAllAndOverride = () => [Role.ADMIN];
    const context = createMockExecutionContext({ role: Role.TEAM_MEMBER, email: 'dev@example.com' });
    rolesGuard.canActivate(context);
    assert(false, 'TEAM_MEMBER should be denied on ADMIN route');
  } catch (err: any) {
    assert(
      err instanceof ForbiddenException,
      'TEAM_MEMBER accessing ADMIN route throws ForbiddenException',
    );
  }

  // Test 5: Manager attempting to access ADMIN-only route is denied
  try {
    reflector.getAllAndOverride = () => [Role.ADMIN];
    const context = createMockExecutionContext({ role: Role.MANAGER, email: 'manager@example.com' });
    rolesGuard.canActivate(context);
    assert(false, 'MANAGER should be denied on ADMIN-only route');
  } catch (err: any) {
    assert(
      err instanceof ForbiddenException,
      'MANAGER accessing ADMIN-only route throws ForbiddenException',
    );
  }

  // Test 6: Manager accessing MANAGER route is allowed
  try {
    reflector.getAllAndOverride = () => [Role.MANAGER, Role.ADMIN];
    const context = createMockExecutionContext({ role: Role.MANAGER, email: 'manager@example.com' });
    const result = rolesGuard.canActivate(context);
    assert(result === true, 'MANAGER role is granted access to MANAGER/ADMIN route');
  } catch (err: any) {
    assert(false, `Manager access failed with error: ${err.message}`);
  }

  // Test 7: Team member accessing TEAM_MEMBER allowed route is granted
  try {
    reflector.getAllAndOverride = () => [Role.TEAM_MEMBER, Role.MANAGER, Role.ADMIN];
    const context = createMockExecutionContext({ role: Role.TEAM_MEMBER, email: 'dev@example.com' });
    const result = rolesGuard.canActivate(context);
    assert(result === true, 'TEAM_MEMBER is granted access to member route');
  } catch (err: any) {
    assert(false, `Team member access failed with error: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`📊 RBAC Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRbacTests();
