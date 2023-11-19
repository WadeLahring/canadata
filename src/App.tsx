import './App.css';
import SiteHeader from './components/navigation/SiteHeader';
import LineChart from './components/lineCharts/LineChart';

const data = [
  { date: new Date(2017, 0), value: 30 },
  { date: new Date(2018, 0), value: 10 },
  { date: new Date(2019, 0), value: 50 },
  { date: new Date(2020, 0), value: 20 },
  { date: new Date(2021, 0), value: 80 },
  { date: new Date(2022, 0), value: 30 },
];

function App() {
  return (
    <div className="h-screen flex flex-col">
      <SiteHeader title="Canadata" />
      <div className="mt-4 max-w-x1 mx-auto -p-4 border">
        <LineChart
          data={data}
          width={800}
          height={600}
          title="GDP per Capita"
          subtitle="Consumption-based estimates converted into 2022 CAD."
          source="Statistics Canada. Gross domestic product, expenditure-based, provincial and territorial, annual - "
          source_link="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3610022201"
          />
      </div>
    </div>
  );
};

export default App;