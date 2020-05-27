import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Page, Config } from 'contentflare-react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'

Config.init({
    organization: process.env.ORGANIZATION_SLUG,
    publicKey:    process.env.PUBLIC_API_KEY,
})

const App = () => {
    const [title,       setTitle]       = useState('')
    const [description, setDescription] = useState('')

    return (
		<Router>
			<Helmet>
				<title>{title}</title>
				<meta name="description" content={description} />
			</Helmet>
			<Switch>
				<Route component={({ location }) => {
					return (
						<Page
							pathname={location.pathname}
							onChange={(error, data) => {
								if (!error) {
									var { title, description, /* properties */ } = data;
									setTitle(title)
									setDescription(description)
								}
							}}
						/>
					)
				}} />
			</Switch>
		</Router>
    )
}

export default App
