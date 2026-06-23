import React, { useMemo } from "react";

const AddonSelectorModal = ({
 open,
 onClose,
 vendors=[],
 vendorCart=[],
 setVendorCart,
 onProceed,
 title='Select Add-ons'
}) => {

if(!open) return null;

const vendorKey=(vendorId,itemId)=>
`${vendorId}::${itemId}`;

const addVendorItem=(vendor,item)=>{

const key=vendorKey(
vendor.vendorId,
item.itemId
);

setVendorCart(prev=>{

const found=prev.find(
x=>x.key===key
);

if(found){
return prev.map(x=>
x.key===key
? {
...x,
quantity:x.quantity+1
}
:x
)
}

return [
...prev,
{
key,
vendorId:vendor.vendorId,
vendorTitle:vendor.title,
itemId:item.itemId,
title:item.title,
price:Number(item.price||0),
quantity:1
}
]

})

}

const incrementVendorItem=(key)=>{
setVendorCart(prev=>
prev.map(x=>
x.key===key
? {
...x,
quantity:x.quantity+1
}
:x
)
)
}

const decrementVendorItem=(key)=>{
setVendorCart(prev=>
prev
.map(x=>
x.key===key
? {
...x,
quantity:x.quantity-1
}
:x
)
.filter(x=>x.quantity>0)
)
}

const removeVendorCartItem=(key)=>{
setVendorCart(prev=>
prev.filter(x=>x.key!==key)
)
}

const addonCount=useMemo(
()=>vendorCart.reduce(
(sum,v)=>sum+v.quantity,
0
),
[vendorCart]
)

const addonTotal=useMemo(
()=>vendorCart.reduce(
(sum,v)=>sum+(v.price*v.quantity),
0
),
[vendorCart]
)

return (
<div className='fixed inset-0 bg-black/50 z-[99999] flex justify-center items-center'>

<div className='bg-white w-[750px] rounded-xl p-6 max-h-[85vh] overflow-auto'>

<h2 className='text-xl font-bold mb-4'>
{title}
</h2>

{vendors.map(v=>(
<div
key={v.vendorId}
className='border rounded p-4 mb-6'
>

<div className='font-semibold mb-4'>
{v.title}
</div>

<div className='grid grid-cols-2 gap-4'>

{v.items.map(item=>{

const key=vendorKey(
v.vendorId,
item.itemId
);

const cartItem=vendorCart.find(
x=>x.key===key
)

return(
<div
key={item.itemId}
className='border rounded p-3'
>

<img
src={item.image}
alt={item.title}
className='h-20 w-full object-cover rounded'
/>

<div className='font-medium mt-2'>
{item.title}
</div>

<div>
₹{item.price}
</div>

{!cartItem ? (

<button
onClick={()=>
addVendorItem(v,item)
}
className='mt-3 w-full bg-green-600 text-white rounded py-1'
>
Add
</button>

):(

<div className='mt-3 flex justify-between items-center'>

<button
onClick={()=>
decrementVendorItem(
cartItem.key
)
}
>
-
</button>

<span>
{cartItem.quantity}
</span>

<button
onClick={()=>
incrementVendorItem(
cartItem.key
)
}
>
+
</button>

<button
onClick={()=>
removeVendorCartItem(
cartItem.key
)
}
className='text-red-500 text-xs'
>
Remove
</button>

</div>

)}

</div>
)

})}

</div>

</div>
))}

<div className='border-t pt-4 mt-4'>

<div>
Addons: {addonCount}
</div>

<div>
Total: ₹{addonTotal}
</div>

</div>

<div className='flex justify-end gap-3 mt-6'>

<button
onClick={onClose}
className='px-4 py-2 bg-gray-300 rounded'
>
Cancel
</button>

<button
onClick={onProceed || onClose}
className='px-4 py-2 bg-green-600 text-white rounded'
>
Done
</button>

</div>

</div>

</div>
)

}

export default AddonSelectorModal;
