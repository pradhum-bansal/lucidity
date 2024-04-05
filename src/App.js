import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, IconButton } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useMemo } from "react";
import { Edit, Delete, Visibility, VisibilityOff } from "@mui/icons-material";
function App() {
  const [data, setData] = useState([]);
  const [adminUser, setAdminUser] = useState(true);
  const handleValue = () => {
    let totalValue = 0;
    data.forEach((item) => {
      let value = !item.disabled && parseFloat(item.value.replace("$", ""));
      totalValue += value;
    });
    return totalValue;
  };
  const calculateNumberOfCategories = () => {
    let categoriesSet = new Set();
    data.forEach((item) => {
      !item.disabled && categoriesSet.add(item.category);
    });
    return categoriesSet.size;
  };
  const calculateOutofStock = () => {
    let outOfStockCount = 0;
    data.forEach((item) => {
      if (item.quantity === 0 && !item.disabled) {
        outOfStockCount++;
      }
    });
    return outOfStockCount;
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: "name", //access nested data with dot notation
        header: "Name",
        size: 200,
      },
      {
        accessorKey: "category",
        header: "Category",
        size: 100,
      },
      {
        accessorKey: "price", //normal accessorKey
        header: "Price",
        size: 100,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        size: 100,
      },
      {
        accessorKey: "value",
        header: "Value",
        size: 100,
      },
    ],
    []
  );

  const handleSaveUser = async ({ values, table }) => {
    const dataCopy = [];
    data.forEach((item) => {
      if (values.name === item.name) {
        dataCopy.push(values);
      } else {
        dataCopy.push(item);
      }
    });
    setData(dataCopy);
    table.setEditingRow(null); //exit editing mode
  };
  const deleteUser = (value) => {
    let dataCopy = [...data];
    dataCopy = dataCopy.filter((item) => item.name.toLowerCase() !== value.toLowerCase());
    setData(dataCopy);
  };
  const disableUser = (value) => {
    let dataCopy = [...data];
    for (let i = 0; i < dataCopy.length; i++) {
      if (dataCopy[i].name === value) {
        dataCopy[i].disabled = !data[i].disabled;
      }
    }
    setData(dataCopy);
  };
  const getData = async () => {
    try {
      const data = await axios.get("https://dev-0tf0hinghgjl39z.api.raw-labs.com/inventory");
      setData(data.data);
    } catch {
      alert("Something went wrong");
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const table = useMaterialReactTable({
    columns,
    data: data,
    enableRowActions: true,
    positionActionsColumn: "last",
    initialState: { density: "compact" },
    enableDensityToggle: false,
    enableTopToolbar: false,
    onEditingRowSave: handleSaveUser,
    renderRowActions: ({ row }) => (
      <Box>
        <IconButton disabled={row?.original?.disabled || !adminUser} onClick={() => table.setEditingRow(row)}>
          <Edit />
        </IconButton>
        <IconButton disabled={!adminUser} onClick={() => deleteUser(row.original.name)}>
          <Delete />
        </IconButton>
        <IconButton disabled={!adminUser} onClick={() => disableUser(row.original.name)}>
          {row?.original?.disabled ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </Box>
    ),
    enablePagination: false
  });
  const numberOfDisableProducts = () => {
    let count = 0;
    data.forEach((item)=> {
      if(item?.disabled){
        count = count+1
      }
    })
    return count;
  }
  return (
    <div className="bg-black block h-full">
      <div className="flex items-center justify-end text-white font-medium text-sm p-8">
        <div className="px-4">User view</div>
        <label for="toggleB" className="flex items-center cursor-pointer">
          <div className="relative">
            <input type="checkbox" id="toggleB" className="sr-only" checked={adminUser} onChange={() => setAdminUser(!adminUser)} />
            <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
          </div>
        </label>
        <div className="px-4">Admin view</div>
      </div>
      <div className="p-20">
        <div className="text-2xl font-medium text-white font-sans">Inventory Stats</div>
        <div className="flex gap-8 py-6 items-center justify-center">
          <div className="bg-green-900 p-6 rounded-xl w-1/4">
            <div className="text-white font-medium text-mf">Total Products</div>
            <div className="text-white font-medium text-3xl">{data.length - numberOfDisableProducts()}</div>
          </div>
          <div className="bg-green-900 p-6 rounded-xl w-1/4">
            <div className="text-white font-medium text-md">Total Store Value</div>
            <div className="text-white font-medium text-3xl">{handleValue()}</div>
          </div>
          <div className="bg-green-900 p-6 rounded-xl w-1/4">
            <div className="text-white font-medium text-md">Out of stocks</div>
            <div className="text-white font-medium text-3xl">{calculateOutofStock()}</div>
          </div>
          <div className="bg-green-900 p-6 rounded-xl w-1/4">
            <div className="text-white font-medium text-md">No. of Category</div>
            <div className="text-white font-medium text-3xl">{calculateNumberOfCategories()} </div>
          </div>
        </div>
        {/* <Table data={data1} /> */}
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}

export default App;
