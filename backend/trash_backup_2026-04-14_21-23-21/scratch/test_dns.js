import dns from 'dns';

const host = 'pg-ef0641c-cardonauribecristian20-10e0.i.aivencloud.com';

console.log(`Checking resolution for: ${host}`);

dns.lookup(host, (err, address, family) => {
  if (err) {
    console.error('Lookup failed:', err);
  } else {
    console.log('Address:', address);
    console.log('Family: IPv', family);
  }
});
