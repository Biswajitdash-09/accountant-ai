
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, ArrowRightLeft, Network } from 'lucide-react';
import { useEntityRelationships } from '@/hooks/useEntityRelationships';
import { useBusinessEntities } from '@/hooks/useBusinessEntities';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

export const MultiEntityManager = () => {
  const { relationships, interEntityTransactions, createRelationship, createInterEntityTransaction } = useEntityRelationships();
  const { entities } = useBusinessEntities();
  const { formatCurrency } = useCurrencyFormatter();
  const [showRelationshipDialog, setShowRelationshipDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);

  const [newRelationship, setNewRelationship] = useState({
    parent_entity_id: '',
    child_entity_id: '',
    relationship_type: 'subsidiary',
    ownership_percentage: 100
  });

  const [newTransaction, setNewTransaction] = useState({
    from_entity_id: '',
    to_entity_id: '',
    transaction_type: 'transfer',
    amount: 0,
    description: ''
  });

  const handleCreateRelationship = async () => {
    await createRelationship.mutateAsync({
      parent_entity_id: newRelationship.parent_entity_id,
      child_entity_id: newRelationship.child_entity_id,
      relationship_type: newRelationship.relationship_type,
      ownership_percentage: newRelationship.ownership_percentage
    });
    setNewRelationship({
      parent_entity_id: '',
      child_entity_id: '',
      relationship_type: 'subsidiary',
      ownership_percentage: 100
    });
    setShowRelationshipDialog(false);
  };

  const handleCreateTransaction = async () => {
    await createInterEntityTransaction.mutateAsync({
      from_entity_id: newTransaction.from_entity_id,
      to_entity_id: newTransaction.to_entity_id,
      transaction_type: newTransaction.transaction_type,
      amount: newTransaction.amount,
      description: newTransaction.description,
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setNewTransaction({
      from_entity_id: '',
      to_entity_id: '',
      transaction_type: 'transfer',
      amount: 0,
      description: ''
    });
    setShowTransactionDialog(false);
  };

  const getEntityName = (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    return entity?.name || 'Unknown Entity';
  };

  const relationshipTypes = [
    { value: 'subsidiary', label: 'Subsidiary' },
    { value: 'parent', label: 'Parent Company' },
    { value: 'affiliate', label: 'Affiliate' },
    { value: 'joint_venture', label: 'Joint Venture' },
    { value: 'partnership', label: 'Partnership' }
  ];

  const transactionTypes = [
    { value: 'transfer', label: 'Internal Transfer' },
    { value: 'loan', label: 'Inter-company Loan' },
    { value: 'dividend', label: 'Dividend Payment' },
    { value: 'service_fee', label: 'Service Fee' },
    { value: 'management_fee', label: 'Management Fee' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-semibold">Multi-Entity Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage relationships and transactions between business entities
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showRelationshipDialog} onOpenChange={setShowRelationshipDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Network className="h-4 w-4" />
                Add Relationship
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Entity Relationship</DialogTitle>
                <DialogDescription>
                  Define how your business entities are related
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Parent Entity</Label>
                  <Select
                    value={newRelationship.parent_entity_id}
                    onValueChange={(value) => setNewRelationship({...newRelationship, parent_entity_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Child Entity</Label>
                  <Select
                    value={newRelationship.child_entity_id}
                    onValueChange={(value) => setNewRelationship({...newRelationship, child_entity_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select child entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.filter(e => e.id !== newRelationship.parent_entity_id).map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Relationship Type</Label>
                  <Select
                    value={newRelationship.relationship_type}
                    onValueChange={(value) => setNewRelationship({...newRelationship, relationship_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ownership Percentage</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newRelationship.ownership_percentage}
                    onChange={(e) => setNewRelationship({...newRelationship, ownership_percentage: Number(e.target.value)})}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateRelationship}
                    disabled={!newRelationship.parent_entity_id || !newRelationship.child_entity_id}
                  >
                    Create Relationship
                  </Button>
                  <Button variant="outline" onClick={() => setShowRelationshipDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Inter-Entity Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Inter-Entity Transaction</DialogTitle>
                <DialogDescription>
                  Record a transaction between business entities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>From Entity</Label>
                  <Select
                    value={newTransaction.from_entity_id}
                    onValueChange={(value) => setNewTransaction({...newTransaction, from_entity_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Entity</Label>
                  <Select
                    value={newTransaction.to_entity_id}
                    onValueChange={(value) => setNewTransaction({...newTransaction, to_entity_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.filter(e => e.id !== newTransaction.from_entity_id).map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transaction Type</Label>
                  <Select
                    value={newTransaction.transaction_type}
                    onValueChange={(value) => setNewTransaction({...newTransaction, transaction_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="Transaction description..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateTransaction}
                    disabled={!newTransaction.from_entity_id || !newTransaction.to_entity_id || newTransaction.amount <= 0}
                  >
                    Create Transaction
                  </Button>
                  <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Entity Relationships
            </CardTitle>
            <CardDescription>
              Ownership and relationship structures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relationships.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No entity relationships defined yet
                </p>
              ) : (
                relationships.map((relationship) => (
                  <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">
                          {getEntityName(relationship.parent_entity_id)} → {getEntityName(relationship.child_entity_id)}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {relationship.relationship_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {relationship.ownership_percentage}%
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Inter-Entity Transactions
            </CardTitle>
            <CardDescription>
              Recent transactions between entities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interEntityTransactions.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No inter-entity transactions recorded yet
                </p>
              ) : (
                interEntityTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">
                          {transaction.from_entity_id && getEntityName(transaction.from_entity_id)} → {transaction.to_entity_id && getEntityName(transaction.to_entity_id)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(transaction.amount, undefined, undefined, { showSymbol: true, decimals: 2 })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
