    import React from 'react'

    const services = () => {
    return (
    <>
    <div id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-100 to-green-10 border border-black-600 inset-shadow-sm">
    <div className="services-container">
        <h1 className="services-header text-3xl font-bold underline">Our Services</h1>
        <p className="services-subheader">
        We provide a range of services to help you find the perfect franchise opportunity.
        </p>

        <div className="services-grid">
        <div className="service-card">
            <h2 className="service-title">Services 1</h2>
            <p className="service-description">
            Browse our extensive database of franchise opportunities across various industries and investment levels.
            </p>
        </div>

        <div className="service-card">
            <h2 className="service-title">Services 2</h2>
            <p className="service-description">
            Get expert advice and guidance from our team of franchise consultants to help you make informed decisions.
            </p>
        </div>

        <div className="service-card">
            <h2 className="service-title">Services 3</h2>
            <p className="service-description">
            We assist you throughout the application process, ensuring all your documents are in order and submitted on time.
            </p>
        </div>
        </div>
    </div>
    </div>
    </>

    )
    }

    export default services
