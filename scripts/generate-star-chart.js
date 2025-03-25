const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const ChartDataLabels = require('chartjs-plugin-datalabels');
const fs = require('fs');
const fetch = require('node-fetch');

async function fetchStargazers() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('❌ 缺少 GITHUB_TOKEN 环境变量，请设置后再运行！');
    return [];
  }

  let allStargazers = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    console.log(`📡 正在获取第 ${page} 页星标数据...`);
    const response = await fetch(`https://api.github.com/repos/iawooo/ctt/stargazers?per_page=${perPage}&page=${page}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3.star+json',
        'User-Agent': 'CFTeleTrans'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ GitHub API 请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      return [];
    }

    const stargazers = await response.json();
    allStargazers = allStargazers.concat(stargazers);

    if (stargazers.length < perPage) break;
    page++;
  }

  console.log(`✅ 成功获取 ${allStargazers.length} 条星标数据`);
  console.log('最近的星标:', allStargazers.slice(-5).map(star => star.starred_at));
  return allStargazers;
}

async function generateChart() {
  const stargazers = await fetchStargazers();
  if (stargazers.length === 0) {
    console.error('❌ 没有获取到星标数据，无法生成图表');
    return;
  }

  const starDates = stargazers.map(star => new Date(star.starred_at));
  const earliestDate = new Date(Math.min(...starDates));
  const now = new Date();

  const monthsDiff = (now.getFullYear() - earliestDate.getFullYear()) * 12 + (now.getMonth() - earliestDate.getMonth()) + 1;
  const starCounts = Array(monthsDiff).fill(0);
  const labels = [];

  for (let i = monthsDiff - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    labels.push(monthStr);
    const count = stargazers.filter(star => {
      const starDate = new Date(star.starred_at);
      return starDate.getFullYear() === date.getFullYear() && starDate.getMonth() === date.getMonth();
    }).length;
    starCounts[monthsDiff - 1 - i] = count;
  }

  for (let i = 1; i < starCounts.length; i++) {
    starCounts[i] += starCounts[i - 1];
  }

  console.log('月份标签:', labels);
  console.log('星标数量:', starCounts);
  console.log(`总星标数: ${starCounts[starCounts.length - 1]}`);

  if (!fs.existsSync('images')) {
    console.log('📁 创建 images 目录...');
    fs.mkdirSync('images');
  }

  const width = 800;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const configuration = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Star 数量',
        data: starCounts,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Star 数量',
            font: { size: 14 }
          },
          ticks: { font: { size: 12 } }
        },
        x: {
          title: {
            display: true,
            text: '月份',
            font: { size: 14 }
          },
          ticks: { font: { size: 12 } }
        }
      },
      plugins: {
        legend: {
          labels: {
            font: { size: 14 }
          }
        },
        datalabels: {
          display: true,
          align: 'top',
          color: '#666',
          font: { size: 12 },
          formatter: (value) => value
        }
      }
    },
    plugins: [ChartDataLabels] // 直接在配置中注册插件
  };

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync('images/star-chart.png', image);
  console.log('✅ Star chart 生成成功: images/star-chart.png');
}

generateChart().catch(err => {
  console.error('❌ 生成图表时发生错误:', err);
  process.exit(1); // 确保错误时退出
});
