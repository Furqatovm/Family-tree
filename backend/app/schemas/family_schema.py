from marshmallow import Schema, fields, validate

class FamilyCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String(allow_none=True)

class FamilyUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=1, max=100))
    description = fields.String(allow_none=True)

class FamilyResponseSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    description = fields.Str(allow_none=True)
    owner_id = fields.Int()
    members_count = fields.Int(dump_only=True)
    created_at = fields.Str()
    updated_at = fields.Str()
