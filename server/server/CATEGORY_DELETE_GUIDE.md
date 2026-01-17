# 🗑️ Category Delete - Smart Protection

## 🛡️ Protection System

Categories cannot be deleted if they are in use. This prevents data integrity issues.

## ❌ When Delete is Blocked

### Category has Restaurants:
```
Error: "Cannot delete category. 3 restaurant(s) are using this category. 
        Please reassign them first."

What to do:
1. Go to Restaurants
2. Change their category to another one
3. Then delete the category
```

### Category has Products:
```
Error: "Cannot delete category. 15 product(s) are using this category. 
        Please reassign them first."

What to do:
1. Go to Products
2. Filter by this category
3. Change their category
4. Then delete
```

### Category has Subcategories:
```
Error: "Cannot delete category. It has 5 subcategory(ies). 
        Please delete them first."

What to do:
1. Go to Subcategories
2. Delete subcategories first
3. Then delete the category
```

## ✅ When Delete Works

Category can be deleted when:
- ✅ No restaurants using it
- ✅ No products using it  
- ✅ No subcategories under it

Example: New unused category

## 🎯 Smart Alternative: Deactivate

When you try to delete a category in use, the system offers to **deactivate** it instead.

### Deactivate vs Delete:

| Action | Data | Visible | Can Reactivate |
|--------|------|---------|----------------|
| **Delete** | Removed permanently | ❌ | ❌ |
| **Deactivate** | Kept in database | ❌ Hidden | ✅ Yes |

### Deactivate Flow:

```
1. Try to delete category
   ↓
2. Error: "Category is in use"
   ↓
3. Popup: "Would you like to deactivate instead?"
   ↓
4. Click "OK"
   ↓
5. Category.isActive = false
   ↓
6. ✅ Hidden from customers, kept in database
```

## 💡 Recommendations

### For Categories in Use:
```
✅ Deactivate (recommended)
   - Keeps data intact
   - Can reactivate later
   - Preserves history

❌ Don't delete
   - Breaks relationships
   - Loses data
```

### For Unused Categories:
```
✅ Safe to delete
   - No data loss
   - Clean database
```

## 🔄 Reactivating Categories

If you deactivated a category by mistake:

```javascript
1. Find category in list (show inactive filter)
2. Click on "Inactive" badge
3. ✅ Category becomes active again
```

Or use API:
```javascript
PATCH /api/categories/:id/toggle
```

## 🎯 Complete Workflow

### Removing Unused Category:
```
1. Click Delete button
2. Confirm deletion
3. ✅ Category deleted
4. ✅ Image deleted
5. ✅ Database cleaned
```

### Removing Category in Use:
```
1. Click Delete button
2. Error message appears
3. Option to deactivate
4. Click "Deactivate"
5. ✅ Category hidden (not deleted)
6. ✅ Restaurants/Products keep their data
```

## 📊 Status Management

### Active Category:
- Visible to customers
- Can be assigned to restaurants
- Shows in dropdowns
- Badge: Green "Active"

### Inactive Category:
- Hidden from customers
- Still linked to existing data
- Not in dropdowns (for new items)
- Badge: Gray "Inactive"

## 🛠️ Implementation Details

### Backend Check:
```javascript
// Before delete, check relations
const category = await prisma.category.findUnique({
    include: {
        restaurants: true,
        products: true,
        subcategories: true
    }
});

if (category.restaurants.length > 0) {
    return error: "Cannot delete - has restaurants"
}
```

### Frontend Smart Delete:
```javascript
try {
    await api.delete(`/categories/${id}`);
    // Success
} catch (error) {
    if (error.message.includes('restaurant')) {
        // Offer to deactivate instead
        const deactivate = confirm("Deactivate instead?");
        if (deactivate) {
            await api.patch(`/categories/${id}/toggle`);
        }
    }
}
```

## ✅ Best Practices

1. **Check before delete** - System does this automatically
2. **Deactivate instead of delete** - For categories in use
3. **Reassign first** - If you really need to delete
4. **Keep history** - Deactivate preserves data

## 🆘 Troubleshooting

### "Cannot delete category"
```
Reason: Category is in use
Solution: Deactivate instead, or reassign items first
```

### "Category deleted but still appears"
```
Reason: Browser cache
Solution: Refresh page (F5)
```

### "Want to permanently remove"
```
Steps:
1. Reassign all restaurants to other categories
2. Reassign all products to other categories
3. Delete all subcategories
4. Then delete the category
```

---

**Smart Delete Protection Active! 🛡️**

Your data is safe from accidental deletions!

