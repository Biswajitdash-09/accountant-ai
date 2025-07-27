
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Edit, Trash2, Network } from "lucide-react";
import { useBusinessEntities } from "@/hooks/useBusinessEntities";
import { useEntityRelationships } from "@/hooks/useEntityRelationships";

export const MultiEntityManager = () => {
  const { businessEntities, isLoading, createBusinessEntity, updateBusinessEntity, deleteBusinessEntity } = useBusinessEntities();
  const { relationships, createRelationship, deleteRelationship } = useEntityRelationships();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [newEntity, setNewEntity] = useState({
    name: '',
    entity_type: '',
    tax_id: '',
    address: {}
  });

  const [newRelationship, setNewRelationship] = useState({
    parent_entity_id: '',
    child_entity_id: '',
    relationship_type: '',
    ownership_percentage: 100
  });

  const entityTypes = [
    'Corporation',
    'LLC',
    'Partnership',
    'Sole Proprietorship',
    'Non-Profit',
    'Trust',
    'Other'
  ];

  const relationshipTypes = [
    'subsidiary',
    'parent',
    'affiliate',
    'joint_venture',
    'partnership'
  ];

  const handleCreateEntity = async () => {
    try {
      await createBusinessEntity.mutateAsync(newEntity);
      setNewEntity({ name: '', entity_type: '', tax_id: '', address: {} });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating entity:', error);
    }
  };

  const handleUpdateEntity = async () => {
    if (!editingEntity) return;
    
    try {
      await updateBusinessEntity.mutateAsync(editingEntity);
      setEditingEntity(null);
    } catch (error) {
      console.error('Error updating entity:', error);
    }
  };

  const handleDeleteEntity = async (entityId: string) => {
    try {
      await deleteBusinessEntity.mutateAsync(entityId);
    } catch (error) {
      console.error('Error deleting entity:', error);
    }
  };

  const handleCreateRelationship = async () => {
    try {
      await createRelationship.mutateAsync(newRelationship);
      setNewRelationship({
        parent_entity_id: '',
        child_entity_id: '',
        relationship_type: '',
        ownership_percentage: 100
      });
    } catch (error) {
      console.error('Error creating relationship:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading entities...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Multi-Entity Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage multiple business entities and their relationships
          </p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Business Entity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="entity-name">Entity Name</Label>
                <Input
                  id="entity-name"
                  value={newEntity.name}
                  onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                  placeholder="Enter entity name"
                />
              </div>
              <div>
                <Label htmlFor="entity-type">Entity Type</Label>
                <Select onValueChange={(value) => setNewEntity({ ...newEntity, entity_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tax-id">Tax ID (Optional)</Label>
                <Input
                  id="tax-id"
                  value={newEntity.tax_id}
                  onChange={(e) => setNewEntity({ ...newEntity, tax_id: e.target.value })}
                  placeholder="Enter tax ID"
                />
              </div>
              <Button onClick={handleCreateEntity} className="w-full">
                Create Entity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessEntities.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No business entities found. Create your first entity to get started.
          </div>
        ) : (
          businessEntities.map((entity) => (
            <Card key={entity.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{entity.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingEntity(entity)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntity(entity.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">{entity.entity_type}</Badge>
                  {entity.tax_id && (
                    <p className="text-xs text-muted-foreground">
                      Tax ID: {entity.tax_id}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(entity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Entity Relationships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select onValueChange={(value) => setNewRelationship({ ...newRelationship, parent_entity_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Parent Entity" />
                </SelectTrigger>
                <SelectContent>
                  {businessEntities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select onValueChange={(value) => setNewRelationship({ ...newRelationship, child_entity_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Child Entity" />
                </SelectTrigger>
                <SelectContent>
                  {businessEntities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select onValueChange={(value) => setNewRelationship({ ...newRelationship, relationship_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Relationship" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleCreateRelationship}>Add Relationship</Button>
            </div>
            
            {relationships.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No entity relationships defined
              </div>
            ) : (
              <div className="space-y-2">
                {relationships.map((relationship) => {
                  const parentEntity = businessEntities.find(e => e.id === relationship.parent_entity_id);
                  const childEntity = businessEntities.find(e => e.id === relationship.child_entity_id);
                  
                  return (
                    <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{parentEntity?.name}</span>
                        <span className="mx-2 text-muted-foreground">→</span>
                        <span className="font-medium">{childEntity?.name}</span>
                        <Badge variant="outline" className="ml-2">{relationship.relationship_type}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRelationship.mutate(relationship.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editingEntity && (
        <Dialog open={!!editingEntity} onOpenChange={() => setEditingEntity(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Business Entity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-entity-name">Entity Name</Label>
                <Input
                  id="edit-entity-name"
                  value={editingEntity.name}
                  onChange={(e) => setEditingEntity({ ...editingEntity, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-entity-type">Entity Type</Label>
                <Select value={editingEntity.entity_type} onValueChange={(value) => setEditingEntity({ ...editingEntity, entity_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-tax-id">Tax ID</Label>
                <Input
                  id="edit-tax-id"
                  value={editingEntity.tax_id || ''}
                  onChange={(e) => setEditingEntity({ ...editingEntity, tax_id: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateEntity} className="w-full">
                Update Entity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
