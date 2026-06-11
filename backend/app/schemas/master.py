from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CategoryCreate(BaseModel):
    name: str = Field(max_length=80)


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class SupplierCreate(BaseModel):
    name: str = Field(max_length=160)
    phone: str | None = Field(default=None, max_length=40)
    email: EmailStr | None = None
    address: str | None = Field(default=None, max_length=255)


class SupplierRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str | None
    email: str | None
    address: str | None


class BranchCreate(BaseModel):
    code: str = Field(max_length=20)
    name: str = Field(max_length=120)
    address: str | None = Field(default=None, max_length=255)


class BranchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    address: str | None


class WarehouseCreate(BaseModel):
    code: str = Field(max_length=20)
    name: str = Field(max_length=120)
    branch_id: int


class WarehouseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    branch_id: int
