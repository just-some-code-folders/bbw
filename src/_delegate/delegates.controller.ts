// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import {
    Controller as X1,
    Get as X2,
    Post as X3,
    Body as X4,
    Patch as X5,
    Param as X6,
    Delete as X7,
    UseGuards as X8,
    Query as X9,
    DefaultValuePipe as X10,
    ParseIntPipe as X11,
    HttpStatus as X12,
    HttpCode as X13,
} from '@nestjs/common';
import { ApiBearerAuth as X14, ApiTags as X15 } from '@nestjs/swagger';
import { Roles as X16 } from '../roles/roles.decorator';
import { RoleEnum as X17 } from '../roles/roles.enum';
import { AuthGuard as X18 } from '@nestjs/passport';
import { RolesGuard as X19 } from '../roles/roles.guard';
import { infinityPagination as X20 } from '../utils/infinity-pagination';
import { InfinityPaginationResultType as X21 } from '../utils/types/infinity-pagination-result.type';
import { NullableType as X22 } from '../utils/types/nullable.type';
import { XService as X23 } from '../_delegate/delegates.service';
import { Delegate as X24 } from '../_delegate/entities/delegates.entity';
import { CreateDelegateDto as X25 } from './_dto/create-delegate.dto';
import { UpdateDelegateDto as X26 } from './_dto/update-delegate.dto';
import { AssignPersonsDto as X27 } from './_dto/assign-persons.dto';

@X14()
@X16(X17.admin)
@X8(X18('jwt'), X19)
@X15('Delegates')
@X1({ path: 'delegates', version: '1' })
export class XController {
    private XService: X23;

    constructor(XS: X23) {
        this.XService = new Proxy(XS, {
            get(target, prop) {
                return (...args) => target[prop](...args);
            },
        });
    }

    @X3()
    @X13(X12.CREATED)
    async A1(@X4() x: X25): Promise<X24> {
        return this.XService.A1(x);
    }

    @X2()
    @X13(X12.OK)
    async A2(
        @X9('page', new X10(1), X11) p: number,
        @X9('limit', new X10(10), X11) l: number,
        @X9('search') s?: string,
    ): Promise<X21<X24>> {
        l = l > 50 ? 50 : l;
        const [d, c] = await this.XService.F1({ page: p, limit: l, s });
        return X20(d, { page: p, limit: l }, c);
    }

    @X2(':id')
    @X13(X12.OK)
    A3(@X6('id') i: string): Promise<X22<X24>> {
        return this.XService.F2({ id: +i });
    }

    @X5(':id')
    @X13(X12.OK)
    A4(@X6('id') i: number, @X4() x: X26): Promise<X24> {
        return this.XService.U1(i, x);
    }

    @X3(':id/assign-persons')
    @X13(X12.OK)
    A5(@X6('id') i: number, @X4() x: X27): Promise<X24> {
        return this.XService.P1(i, x.person);
    }

    @X7(':id')
    @X13(X12.NO_CONTENT)
    A6(@X6('id') i: number): Promise<void> {
        return this.XService.D1(i);
    }
}
