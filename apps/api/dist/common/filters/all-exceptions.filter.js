"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@talentflow/shared");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let errorResponse;
        if (exception instanceof shared_1.TalentFlowError) {
            status = exception.statusCode;
            errorResponse = (0, shared_1.createErrorResponse)(exception);
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            errorResponse = {
                success: false,
                error: {
                    code: 'HTTP_EXCEPTION',
                    message: typeof exceptionResponse === 'string'
                        ? exceptionResponse
                        : exceptionResponse.message || exception.message,
                    details: typeof exceptionResponse === 'object' ? exceptionResponse : undefined,
                },
            };
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            errorResponse = {
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'An unexpected error occurred',
                },
            };
            this.logger.error(`Unexpected error: ${exception}`, exception.stack, `${request.method} ${request.url}`);
        }
        errorResponse.meta = {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            version: 'v1',
        };
        response.status(status).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map