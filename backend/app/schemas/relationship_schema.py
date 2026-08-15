from marshmallow import Schema, fields, validate

class RelationshipCreateSchema(Schema):
    person_1_id = fields.Integer(required=True)
    person_2_id = fields.Integer(required=True)
    relationship_type = fields.String(
        required=True,
        validate=validate.OneOf(['parent', 'child', 'spouse', 'sibling', 'grandparent', 'grandchild', 'relative'])
    )

class RelationshipResponseSchema(Schema):
    id = fields.Int()
    family_id = fields.Int()
    person_1_id = fields.Int()
    person_2_id = fields.Int()
    relationship_type = fields.Str()
    created_at = fields.Str()
