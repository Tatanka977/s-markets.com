<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>SmartLend</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Inter,sans-serif;
}

body{
    background:#f8fafc;
    color:#1e293b;
}

.container{
    width:90%;
    max-width:1200px;
    margin:auto;
}

header{
    background:#fff;
    position:sticky;
    top:0;
    z-index:100;
    box-shadow:0 5px 20px rgba(0,0,0,.05);
}

nav{
    display:flex;
    justify-content:space-between;
    align-items:center;
    height:75px;
}

.logo{
    font-size:28px;
    font-weight:800;
    color:#2563eb;
}

nav ul{
    display:flex;
    gap:30px;
    list-style:none;
}

nav a{
    text-decoration:none;
    color:#334155;
    font-weight:500;
}

.btn{
    display:inline-block;
    padding:14px 30px;
    border-radius:10px;
    text-decoration:none;
    font-weight:600;
    transition:.3s;
}

.btn-primary{
    background:#2563eb;
    color:#fff;
}

.btn-primary:hover{
    background:#1d4ed8;
}

.btn-light{
    background:#fff;
    color:#2563eb;
}

.hero{
    padding:90px 0;
}

.hero-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:50px;
    align-items:center;
}

.hero h1{
    font-size:56px;
    line-height:1.1;
    margin-bottom:20px;
}

.hero p{
    font-size:18px;
    color:#64748b;
    margin-bottom:35px;
}

.hero img{
    width:100%;
}

.stats{
    display:flex;
    gap:40px;
    margin-top:40px;
}

.stat h2{
    color:#2563eb;
}

.features{
    padding:90px 0;
}

.section-title{
    text-align:center;
    margin-bottom:50px;
}

.cards{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:25px;
}

.card{
    background:#fff;
    padding:35px;
    border-radius:15px;
    box-shadow:0 10px 30px rgba(0,0,0,.05);
}

.card h3{
    margin:20px 0 10px;
}

.card p{
    color:#64748b;
}

.icon{
    width:60px;
    height:60px;
    background:#dbeafe;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:15px;
    font-size:28px;
}

.cta{
    padding:100px 0;
    text-align:center;
    background:#2563eb;
    color:#fff;
}

.cta h2{
    font-size:42px;
    margin-bottom:20px;
}

footer{
    padding:40px;
    text-align:center;
    background:#0f172a;
    color:#cbd5e1;
}

@media(max-width:900px){

.hero-grid,
.cards{
grid-template-columns:1fr;
}

nav ul{
display:none;
}

.hero h1{
font-size:40px;
}

.stats{
flex-direction:column;
gap:20px;
}

}
</style>
</head>
<body>

<header>

<div class="container">

<nav>

<div class="logo">SmartLend</div>

<ul>
<li><a href="#">Home</a></li>
<li><a href="#">Loans</a></li>
<li><a href="#">How It Works</a></li>
<li><a href="#">About</a></li>
<li><a href="#">Contact</a></li>
</ul>

<a href="#" class="btn btn-primary">Apply Now</a>

</nav>

</div>

</header>

<section class="hero">

<div class="container">

<div class="hero-grid">

<div>

<h1>Fast Personal Loans in Minutes</h1>

<p>
Get approved quickly with competitive interest rates and flexible repayment plans.
No hidden fees. Simple online application.
</p>

<a href="#" class="btn btn-primary">Get Started</a>
<a href="#" class="btn btn-light">Learn More</a>

<div class="stats">

<div class="stat">
<h2>50K+</h2>
<p>Customers</p>
</div>

<div class="stat">
<h2>$100M+</h2>
<p>Loans Funded</p>
</div>

<div class="stat">
<h2>4.9★</h2>
<p>Customer Rating</p>
</div>

</div>

</div>

<div>

<img src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800" alt="Loan">

</div>

</div>

</div>

</section>

<section class="features">

<div class="container">

<div class="section-title">

<h2>Why Choose SmartLend?</h2>

<p>Simple, secure, and transparent lending solutions.</p>

</div>

<div class="cards">

<div class="card">

<div class="icon">⚡</div>

<h3>Instant Approval</h3>

<p>
Get loan decisions within minutes using our intelligent approval system.
</p>

</div>

<div class="card">

<div class="icon">🔒</div>

<h3>Secure Process</h3>

<p>
Bank-level encryption keeps your financial information protected.
</p>

</div>

<div class="card">

<div class="icon">💳</div>

<h3>Flexible Repayment</h3>

<p>
Choose repayment schedules that fit your monthly budget.
</p>

</div>

</div>

</div>

</section>

<section class="cta">

<div class="container">

<h2>Ready to Apply?</h2>

<p style="margin-bottom:30px;">
Join thousands of customers who trust SmartLend for fast financing.
</p>

<a href="#" class="btn btn-light">
Apply for a Loan
</a>

</div>

</section>

<footer>

© 2026 SmartLend. All Rights Reserved.

</footer>

</body>
</html>
